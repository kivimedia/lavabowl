import { Hono } from "hono";
import { db } from "../db/index.js";
import { projects, fixRequests, deployments } from "../db/schema.js";
import { eq, and, count, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { createProjectSchema, updateProjectSchema, submitFixSchema } from "../lib/validators.js";
import type { AppVariables } from "../types.js";
import { runMigration } from "../services/migration.js";
import * as vercel from "../services/vercel.js";
import { triageFixRequest } from "../services/fix-pipeline.js";

const projectRoutes = new Hono<{ Variables: AppVariables }>();

// All routes require auth
projectRoutes.use("*", authMiddleware);

// GET /api/projects - List user's projects
projectRoutes.get("/", async (c) => {
  const user = c.get("user");
  const result = await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, user.id), sql`${projects.status} != 'deleted'`))
    .orderBy(sql`${projects.updatedAt} DESC`);
  return c.json(result);
});

// GET /api/projects/check-subdomain/:subdomain - Check availability
projectRoutes.get("/check-subdomain/:subdomain", async (c) => {
  const subdomain = c.req.param("subdomain").toLowerCase();
  const [existing] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.subdomain, subdomain))
    .limit(1);
  return c.json({ available: !existing, subdomain });
});

// GET /api/projects/:id - Get single project
projectRoutes.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .limit(1);
  if (!project) return c.json({ error: "Project not found" }, 404);
  return c.json(project);
});

// GET /api/projects/:id/stats - Get project stats
projectRoutes.get("/:id/stats", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  // Verify ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .limit(1);
  if (!project) return c.json({ error: "Project not found" }, 404);

  // Count fixes
  const [fixStats] = await db
    .select({ total: count() })
    .from(fixRequests)
    .where(eq(fixRequests.projectId, id));

  const [deployedFixes] = await db
    .select({ total: count() })
    .from(fixRequests)
    .where(and(eq(fixRequests.projectId, id), eq(fixRequests.status, "deployed")));

  // Count deployments
  const [deployStats] = await db
    .select({ total: count() })
    .from(deployments)
    .where(eq(deployments.projectId, id));

  return c.json({
    uptime: 99.9, // placeholder - would come from Vercel/monitoring
    totalFixes: fixStats?.total ?? 0,
    deployedFixes: deployedFixes?.total ?? 0,
    totalDeployments: deployStats?.total ?? 0,
    status: project.status,
  });
});

// POST /api/projects - Create project
projectRoutes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  const data = parsed.data;

  // Check subdomain uniqueness
  if (data.subdomain) {
    const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.subdomain, data.subdomain))
      .limit(1);
    if (existing) {
      return c.json({ error: "Subdomain already taken" }, 409);
    }
  }

  const [newProject] = await db
    .insert(projects)
    .values({
      userId: user.id,
      name: data.name,
      githubRepoUrl: data.githubRepoUrl,
      supabaseUrl: data.supabaseUrl,
      supabaseAnonKey: data.supabaseAnonKey,
      subdomain: data.subdomain,
      customDomain: data.customDomain,
      status: "onboarding",
    })
    .returning();

  // Fire-and-forget: start migration pipeline if GitHub URL provided
  if (data.githubRepoUrl) {
    runMigration({
      projectId: newProject.id,
      githubRepoUrl: data.githubRepoUrl,
      supabaseUrl: data.supabaseUrl,
      supabaseAnonKey: data.supabaseAnonKey,
    }).catch((err) => {
      console.error(`[projects] Background migration failed:`, err);
    });
  }

  return c.json(newProject, 201);
});

// PUT /api/projects/:id - Update project
projectRoutes.put("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  // Verify ownership
  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .limit(1);
  if (!existing) return c.json({ error: "Project not found" }, 404);

  const [updated] = await db
    .update(projects)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();

  return c.json(updated);
});

// DELETE /api/projects/:id - Soft delete project
projectRoutes.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [existing] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
    .limit(1);
  if (!existing) return c.json({ error: "Project not found" }, 404);

  const [deleted] = await db
    .update(projects)
    .set({ status: "deleted", updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();

  return c.json(deleted);
});

// ======================================================
// Nested routes: fixes and deployments under projects
// ======================================================

// GET /api/projects/:projectId/fixes - List fixes for a project
projectRoutes.get("/:projectId/fixes", async (c) => {
  const user = c.get("user");
  const projectId = c.req.param("projectId");

  // Verify ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const fixes = await db
    .select()
    .from(fixRequests)
    .where(eq(fixRequests.projectId, projectId))
    .orderBy(sql`${fixRequests.createdAt} DESC`);

  return c.json(fixes);
});

// POST /api/projects/:projectId/fixes - Submit a new fix
projectRoutes.post("/:projectId/fixes", async (c) => {
  const user = c.get("user");
  const projectId = c.req.param("projectId");
  const body = await c.req.json();
  const parsed = submitFixSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  // Verify ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);
  if (!project) return c.json({ error: "Project not found" }, 404);

  // Calculate price
  const priceInCents = user.fixCount < 30 ? 300 : 500;

  const [fix] = await db
    .insert(fixRequests)
    .values({
      projectId,
      userId: user.id,
      description: parsed.data.description,
      status: "submitted",
      priceInCents,
    })
    .returning();

  // Fire-and-forget: auto-triage the fix
  triageFixRequest(fix.id).catch((err) => {
    console.error(`[projects] Auto-triage failed for fix ${fix.id}:`, err);
  });

  return c.json(fix, 201);
});

// GET /api/projects/:projectId/deployments - List deployments
projectRoutes.get("/:projectId/deployments", async (c) => {
  const user = c.get("user");
  const projectId = c.req.param("projectId");

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);
  if (!project) return c.json({ error: "Project not found" }, 404);

  const deploys = await db
    .select()
    .from(deployments)
    .where(eq(deployments.projectId, projectId))
    .orderBy(sql`${deployments.createdAt} DESC`);

  return c.json(deploys);
});

// POST /api/projects/:projectId/deployments - Trigger new deployment
projectRoutes.post("/:projectId/deployments", async (c) => {
  const user = c.get("user");
  const projectId = c.req.param("projectId");

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)))
    .limit(1);
  if (!project) return c.json({ error: "Project not found" }, 404);

  // Trigger a real Vercel deployment if the project has a Vercel project linked
  if (project.vercelProjectId && project.githubRepoFullName) {
    try {
      const vercelDeploy = await vercel.createDeployment({
        projectName: project.vercelProjectId,
        gitRepoFullName: project.githubRepoFullName,
        branch: "main",
        commitMessage: "Manual redeploy triggered",
      });

      const [deploy] = await db
        .insert(deployments)
        .values({
          projectId,
          vercelDeploymentId: vercelDeploy.id,
          branch: "main",
          status: "building",
          url: vercelDeploy.url,
          commitMessage: "Manual redeploy triggered",
        })
        .returning();

      return c.json(deploy, 201);
    } catch (err) {
      console.error("[deploy] Vercel deployment failed:", err);
      return c.json({ error: "Failed to trigger deployment" }, 500);
    }
  }

  // Fallback: record it as queued (no Vercel integration yet)
  const [deploy] = await db
    .insert(deployments)
    .values({
      projectId,
      branch: "main",
      status: "queued",
      commitMessage: "Manual redeploy triggered",
    })
    .returning();

  return c.json(deploy, 201);
});

export default projectRoutes;
