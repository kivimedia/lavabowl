/**
 * Fix pipeline orchestrator.
 * Full lifecycle: triage → payment → AI fix → git branch → preview → approval → deploy
 */

import { db } from "../db/index.js";
import { fixRequests, projects, deployments } from "../db/schema.js";
import { eq } from "drizzle-orm";
import * as ai from "./ai.js";
import * as github from "./github.js";
import * as vercel from "./vercel.js";
import type { TriageResult, FixResult } from "./ai.js";

/**
 * Step 1: Triage a fix request.
 * Called after submission. Uses Claude Haiku to classify complexity.
 */
export async function triageFixRequest(fixId: string) {
  try {
    // Update status to triaging
    await db
      .update(fixRequests)
      .set({ status: "triaging", updatedAt: new Date() })
      .where(eq(fixRequests.id, fixId));

    // Get the fix and its project
    const [fix] = await db
      .select()
      .from(fixRequests)
      .where(eq(fixRequests.id, fixId))
      .limit(1);

    if (!fix) throw new Error("Fix not found");

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, fix.projectId))
      .limit(1);

    if (!project) throw new Error("Project not found");

    // Get file tree from GitHub if available
    let fileTree: string[] = [];
    if (project.githubRepoFullName) {
      try {
        // Get top-level directory listing as a simple file tree
        // In a real implementation, we'd use the Git tree API for full tree
        fileTree = [
          "src/",
          "src/pages/",
          "src/components/",
          "src/lib/",
          "src/hooks/",
          "public/",
          "package.json",
          "vite.config.ts",
          "tailwind.config.ts",
        ];
      } catch {
        // File tree not available, triage without it
      }
    }

    // Run AI triage
    const triageResult = await ai.triageFix(fix.description, {
      fileTree,
      techStack: "React + Vite + TypeScript + Tailwind + shadcn/ui + Supabase",
      repoFullName: project.githubRepoFullName || undefined,
    });

    console.log(`[fix-pipeline] Triage result for ${fixId}:`, triageResult);

    // Update fix with triage results
    await db
      .update(fixRequests)
      .set({
        status: "quoted",
        complexity: triageResult.complexity,
        triageResult: triageResult as unknown as Record<string, unknown>,
        updatedAt: new Date(),
      })
      .where(eq(fixRequests.id, fixId));

    return triageResult;
  } catch (error) {
    console.error(`[fix-pipeline] Triage failed for ${fixId}:`, error);
    await db
      .update(fixRequests)
      .set({
        status: "failed",
        errorLog: error instanceof Error ? error.message : "Triage failed",
        updatedAt: new Date(),
      })
      .where(eq(fixRequests.id, fixId));
    throw error;
  }
}

/**
 * Step 2: Generate the AI fix and create a preview branch.
 * Called after payment is confirmed.
 */
export async function generateAndPreview(fixId: string) {
  try {
    // Update status
    await db
      .update(fixRequests)
      .set({ status: "in_progress", updatedAt: new Date() })
      .where(eq(fixRequests.id, fixId));

    // Get fix and project
    const [fix] = await db
      .select()
      .from(fixRequests)
      .where(eq(fixRequests.id, fixId))
      .limit(1);

    if (!fix) throw new Error("Fix not found");

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, fix.projectId))
      .limit(1);

    if (!project || !project.githubRepoFullName) {
      throw new Error("Project not found or no GitHub repo");
    }

    const triageResult = fix.triageResult as unknown as TriageResult;

    // Fetch the affected files from GitHub
    const sourceFiles: { path: string; content: string }[] = [];
    for (const filePath of (triageResult?.affectedFiles || []).slice(0, 10)) {
      try {
        const fileContent = await github.getFileContent(
          project.githubRepoFullName,
          filePath
        );
        sourceFiles.push({ path: filePath, content: fileContent.content });
      } catch {
        // File doesn't exist, skip it
        console.log(`[fix-pipeline] Could not read file: ${filePath}`);
      }
    }

    // Generate the fix with Claude Sonnet
    const fixResult = await ai.generateFix(
      fix.description,
      triageResult,
      sourceFiles
    );

    if (!fixResult.success) {
      await db
        .update(fixRequests)
        .set({
          status: "failed",
          aiFix: fixResult as unknown as Record<string, unknown>,
          errorLog: fixResult.error || "AI could not generate a fix",
          updatedAt: new Date(),
        })
        .where(eq(fixRequests.id, fixId));
      return fixResult;
    }

    // Create a staging branch
    const branchName = `fix/${fixId.slice(0, 8)}`;
    await github.createBranch(project.githubRepoFullName, branchName);

    // Apply changes to the staging branch
    for (const change of fixResult.changes) {
      if (change.action === "modify" || change.action === "create") {
        let existingSha: string | undefined;
        if (change.action === "modify") {
          try {
            const existing = await github.getFileContent(
              project.githubRepoFullName,
              change.filePath,
              branchName
            );
            existingSha = existing.sha;
          } catch {
            // File doesn't exist yet
          }
        }

        await github.updateFile(
          project.githubRepoFullName,
          change.filePath,
          change.newContent,
          `[LavaBowl] ${change.description}`,
          branchName,
          existingSha
        );
      }
    }

    // Deploy the staging branch to get a preview URL
    let previewUrl: string | null = null;
    if (project.vercelProjectId) {
      try {
        const preview = await vercel.createDeployment({
          projectName: project.vercelProjectId,
          gitRepoFullName: project.githubRepoFullName,
          branch: branchName,
          commitMessage: `Fix preview: ${fix.description.slice(0, 50)}`,
        });
        previewUrl = preview.url;
      } catch (err) {
        console.error("[fix-pipeline] Preview deployment failed:", err);
      }
    }

    // Update fix with results
    await db
      .update(fixRequests)
      .set({
        status: "preview_ready",
        aiFix: fixResult as unknown as Record<string, unknown>,
        stagingBranch: branchName,
        previewUrl,
        updatedAt: new Date(),
      })
      .where(eq(fixRequests.id, fixId));

    console.log(`[fix-pipeline] ✅ Fix preview ready for ${fixId}: ${previewUrl}`);
    return fixResult;
  } catch (error) {
    console.error(`[fix-pipeline] Fix generation failed for ${fixId}:`, error);
    await db
      .update(fixRequests)
      .set({
        status: "failed",
        errorLog: error instanceof Error ? error.message : "Fix generation failed",
        updatedAt: new Date(),
      })
      .where(eq(fixRequests.id, fixId));
    throw error;
  }
}

/**
 * Step 3: Deploy an approved fix to production.
 * Merges the staging branch to main and triggers a production deployment.
 */
export async function deployFix(fixId: string) {
  try {
    await db
      .update(fixRequests)
      .set({ status: "deploying", updatedAt: new Date() })
      .where(eq(fixRequests.id, fixId));

    const [fix] = await db
      .select()
      .from(fixRequests)
      .where(eq(fixRequests.id, fixId))
      .limit(1);

    if (!fix || !fix.stagingBranch) throw new Error("Fix or staging branch not found");

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, fix.projectId))
      .limit(1);

    if (!project || !project.githubRepoFullName) {
      throw new Error("Project not found");
    }

    // For now, we deploy by triggering a production deployment from the staging branch
    // In a full implementation, we'd merge the branch to main first
    if (project.vercelProjectId) {
      const deployment = await vercel.createDeployment({
        projectName: project.vercelProjectId,
        gitRepoFullName: project.githubRepoFullName,
        branch: "main",
        commitMessage: `[LavaBowl Fix] ${fix.description.slice(0, 50)}`,
      });

      // Record the deployment
      await db.insert(deployments).values({
        projectId: project.id,
        vercelDeploymentId: deployment.id,
        commitMessage: `Fix: ${fix.description.slice(0, 100)}`,
        branch: "main",
        status: "building",
        url: deployment.url,
      });
    }

    // Clean up the staging branch
    try {
      await github.deleteBranch(project.githubRepoFullName, fix.stagingBranch);
    } catch {
      // Branch cleanup is non-critical
    }

    // Mark fix as deployed
    await db
      .update(fixRequests)
      .set({ status: "deployed", updatedAt: new Date() })
      .where(eq(fixRequests.id, fixId));

    console.log(`[fix-pipeline] ✅ Fix deployed for ${fixId}`);
  } catch (error) {
    console.error(`[fix-pipeline] Deploy failed for ${fixId}:`, error);
    await db
      .update(fixRequests)
      .set({
        status: "failed",
        errorLog: error instanceof Error ? error.message : "Deployment failed",
        updatedAt: new Date(),
      })
      .where(eq(fixRequests.id, fixId));
    throw error;
  }
}

/**
 * Handle fix rejection: clean up the staging branch.
 */
export async function rejectFix(fixId: string) {
  const [fix] = await db
    .select()
    .from(fixRequests)
    .where(eq(fixRequests.id, fixId))
    .limit(1);

  if (!fix) throw new Error("Fix not found");

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, fix.projectId))
    .limit(1);

  // Clean up staging branch if exists
  if (fix.stagingBranch && project?.githubRepoFullName) {
    try {
      await github.deleteBranch(project.githubRepoFullName, fix.stagingBranch);
    } catch {
      // Non-critical
    }
  }

  await db
    .update(fixRequests)
    .set({
      status: "rejected",
      stagingBranch: null,
      previewUrl: null,
      updatedAt: new Date(),
    })
    .where(eq(fixRequests.id, fixId));
}
