import { Hono } from "hono";
import { db } from "../db/index.js";
import { deployments, projects } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import type { AppVariables } from "../types.js";

const deploymentRoutes = new Hono<{ Variables: AppVariables }>();

deploymentRoutes.use("*", authMiddleware);

// GET /api/deployments/:id - Get deployment detail
deploymentRoutes.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [deploy] = await db
    .select()
    .from(deployments)
    .where(eq(deployments.id, id))
    .limit(1);

  if (!deploy) return c.json({ error: "Deployment not found" }, 404);

  // Verify project ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, deploy.projectId), eq(projects.userId, user.id)))
    .limit(1);

  if (!project) return c.json({ error: "Deployment not found" }, 404);
  return c.json(deploy);
});

// POST /api/deployments/:id/rollback - Rollback to this deployment
deploymentRoutes.post("/:id/rollback", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [deploy] = await db
    .select()
    .from(deployments)
    .where(eq(deployments.id, id))
    .limit(1);

  if (!deploy) return c.json({ error: "Deployment not found" }, 404);

  // Verify ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, deploy.projectId), eq(projects.userId, user.id)))
    .limit(1);
  if (!project) return c.json({ error: "Deployment not found" }, 404);

  // TODO: Phase 10 - Trigger actual Vercel rollback
  // For now, create a new deployment record representing the rollback
  const [rollback] = await db
    .insert(deployments)
    .values({
      projectId: deploy.projectId,
      commitHash: deploy.commitHash,
      commitMessage: `Rollback to ${deploy.commitHash?.slice(0, 7) || "previous"}`,
      branch: deploy.branch,
      status: "queued",
    })
    .returning();

  return c.json(rollback, 201);
});

export default deploymentRoutes;
