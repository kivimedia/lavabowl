/**
 * Migration orchestrator.
 * Handles the full flow: validate repo → fork to LavaBowl org → create Vercel project → deploy.
 */

import { db } from "../db/index.js";
import { projects, deployments } from "../db/schema.js";
import { eq } from "drizzle-orm";
import * as github from "./github.js";
import * as vercel from "./vercel.js";

export interface MigrationInput {
  projectId: string;
  githubRepoUrl: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface MigrationResult {
  success: boolean;
  vercelProjectId?: string;
  vercelUrl?: string;
  githubRepoFullName?: string;
  error?: string;
}

/**
 * Run the full migration pipeline for a project.
 * This is designed to be called async (fire and forget from the API).
 */
export async function runMigration(
  input: MigrationInput
): Promise<MigrationResult> {
  const { projectId, githubRepoUrl, supabaseUrl, supabaseAnonKey } = input;

  try {
    // 1. Update project status to "migrating"
    await db
      .update(projects)
      .set({ status: "migrating", updatedAt: new Date() })
      .where(eq(projects.id, projectId));

    // 2. Parse and validate the GitHub repo
    console.log(`[migration] Parsing GitHub URL: ${githubRepoUrl}`);
    const repoFullName = github.parseGitHubUrl(githubRepoUrl);
    const repoInfo = await github.getRepoInfo(repoFullName);
    console.log(`[migration] Repo found: ${repoInfo.fullName} (${repoInfo.language})`);

    // 3. Fork the repo into our org for management
    console.log(`[migration] Forking repo...`);
    let managedRepo: Awaited<ReturnType<typeof github.forkRepo>>;
    try {
      managedRepo = await github.forkRepo(repoFullName);
      console.log(`[migration] Forked to: ${managedRepo.fullName}`);
    } catch (forkError) {
      // If fork fails (e.g., already exists), try to use existing
      console.log(`[migration] Fork failed, using original repo: ${repoFullName}`);
      managedRepo = {
        fullName: repoFullName,
        htmlUrl: repoInfo.htmlUrl,
        cloneUrl: repoInfo.cloneUrl,
        defaultBranch: repoInfo.defaultBranch,
      };
    }

    // 4. Update project with the managed repo info
    await db
      .update(projects)
      .set({
        githubRepoFullName: managedRepo.fullName,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    // 5. Create Vercel project linked to the GitHub repo
    const projectSlug = managedRepo.fullName
      .split("/")[1]
      ?.replace(/[^a-z0-9-]/gi, "-")
      .toLowerCase()
      .slice(0, 50);

    console.log(`[migration] Creating Vercel project: ${projectSlug}`);
    const envVars: Record<string, string> = {};
    if (supabaseUrl) envVars.VITE_SUPABASE_URL = supabaseUrl;
    if (supabaseAnonKey) envVars.VITE_SUPABASE_ANON_KEY = supabaseAnonKey;

    const vercelProject = await vercel.createVercelProject({
      name: projectSlug || `project-${projectId.slice(0, 8)}`,
      gitRepoFullName: managedRepo.fullName,
      framework: "vite",
      envVars,
    });

    console.log(`[migration] Vercel project created: ${vercelProject.projectId}`);

    // 6. Trigger the initial deployment
    console.log(`[migration] Triggering deployment...`);
    const deployment = await vercel.createDeployment({
      projectName: vercelProject.name,
      gitRepoFullName: managedRepo.fullName,
      branch: managedRepo.defaultBranch,
      commitMessage: "Initial LavaBowl migration",
    });

    console.log(`[migration] Deployment created: ${deployment.id} → ${deployment.url}`);

    // 7. Record the deployment in our DB
    await db.insert(deployments).values({
      projectId,
      vercelDeploymentId: deployment.id,
      commitMessage: "Initial LavaBowl migration",
      branch: managedRepo.defaultBranch,
      status: "building",
      url: deployment.url,
    });

    // 8. Update project to active with Vercel info
    await db
      .update(projects)
      .set({
        status: "active",
        vercelProjectId: vercelProject.projectId,
        vercelDeploymentUrl: deployment.url,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    console.log(`[migration] ✅ Migration complete for project ${projectId}`);

    return {
      success: true,
      vercelProjectId: vercelProject.projectId,
      vercelUrl: deployment.url || undefined,
      githubRepoFullName: managedRepo.fullName,
    };
  } catch (error) {
    console.error(`[migration] ❌ Migration failed for project ${projectId}:`, error);

    // Update project status to indicate failure but keep it pending (not deleted)
    await db
      .update(projects)
      .set({
        status: "onboarding",
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during migration",
    };
  }
}

/**
 * Check deployment status and update our records.
 */
export async function pollDeploymentStatus(
  projectId: string,
  vercelDeploymentId: string
) {
  try {
    const status = await vercel.getDeployment(vercelDeploymentId);

    // Map Vercel states to our states
    let ourStatus: "queued" | "building" | "ready" | "error" | "cancelled";
    switch (status.readyState) {
      case "READY":
        ourStatus = "ready";
        break;
      case "ERROR":
        ourStatus = "error";
        break;
      case "CANCELED":
        ourStatus = "cancelled";
        break;
      case "BUILDING":
        ourStatus = "building";
        break;
      default:
        ourStatus = "queued";
    }

    // Update deployment record
    await db
      .update(deployments)
      .set({
        status: ourStatus,
        url: status.url,
      })
      .where(eq(deployments.vercelDeploymentId, vercelDeploymentId));

    // If ready, update the project's deployment URL
    if (ourStatus === "ready" && status.url) {
      await db
        .update(projects)
        .set({
          vercelDeploymentUrl: status.url,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId));
    }

    return { status: ourStatus, url: status.url };
  } catch (error) {
    console.error(`[poll] Error polling deployment ${vercelDeploymentId}:`, error);
    return { status: "error", url: null };
  }
}
