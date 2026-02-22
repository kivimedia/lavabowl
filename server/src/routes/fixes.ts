import { Hono } from "hono";
import { db } from "../db/index.js";
import { fixRequests, projects, users } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import type { AppVariables } from "../types.js";
import { triageFixRequest, generateAndPreview, deployFix, rejectFix as rejectFixPipeline } from "../services/fix-pipeline.js";
import { createOrGetCustomer, createFixPaymentIntent } from "../services/stripe.js";

const fixRoutes = new Hono<{ Variables: AppVariables }>();

fixRoutes.use("*", authMiddleware);

// GET /api/fixes/:id - Get single fix detail
fixRoutes.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [fix] = await db
    .select()
    .from(fixRequests)
    .where(and(eq(fixRequests.id, id), eq(fixRequests.userId, user.id)))
    .limit(1);

  if (!fix) return c.json({ error: "Fix request not found" }, 404);
  return c.json(fix);
});

// POST /api/fixes/:id/triage - Manually trigger triage (auto-triggered on submit too)
fixRoutes.post("/:id/triage", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [fix] = await db
    .select()
    .from(fixRequests)
    .where(and(eq(fixRequests.id, id), eq(fixRequests.userId, user.id)))
    .limit(1);

  if (!fix) return c.json({ error: "Fix request not found" }, 404);

  // Fire-and-forget triage
  triageFixRequest(id).catch((err) => {
    console.error(`[fixes] Triage failed for ${id}:`, err);
  });

  return c.json({ message: "Triage started", fixId: id });
});

// POST /api/fixes/:id/confirm - Confirm fix price, create Stripe payment
fixRoutes.post("/:id/confirm", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [fix] = await db
    .select()
    .from(fixRequests)
    .where(and(eq(fixRequests.id, id), eq(fixRequests.userId, user.id)))
    .limit(1);

  if (!fix) return c.json({ error: "Fix request not found" }, 404);
  if (fix.status !== "submitted" && fix.status !== "quoted") {
    return c.json({ error: "Fix is not in a confirmable state" }, 400);
  }

  // Create Stripe PaymentIntent for the fix
  try {
    const customerId = await createOrGetCustomer(
      user.id,
      user.email,
      user.fullName || undefined
    );

    const paymentIntent = await createFixPaymentIntent(
      customerId,
      fix.id,
      fix.priceInCents || 300
    );

    const [updated] = await db
      .update(fixRequests)
      .set({
        status: "awaiting_payment",
        stripePaymentIntentId: paymentIntent.id,
        updatedAt: new Date(),
      })
      .where(eq(fixRequests.id, id))
      .returning();

    return c.json({
      ...updated,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("[fixes] Payment creation failed:", err);
    return c.json({ error: "Failed to create payment" }, 500);
  }
});

// POST /api/fixes/:id/start - Start AI fix generation (called after payment succeeds)
fixRoutes.post("/:id/start", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [fix] = await db
    .select()
    .from(fixRequests)
    .where(and(eq(fixRequests.id, id), eq(fixRequests.userId, user.id)))
    .limit(1);

  if (!fix) return c.json({ error: "Fix request not found" }, 404);

  // Fire-and-forget the AI fix generation
  generateAndPreview(id).catch((err) => {
    console.error(`[fixes] Fix generation failed for ${id}:`, err);
  });

  return c.json({ message: "Fix generation started", fixId: id });
});

// POST /api/fixes/:id/approve - Approve preview, deploy to prod
fixRoutes.post("/:id/approve", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [fix] = await db
    .select()
    .from(fixRequests)
    .where(and(eq(fixRequests.id, id), eq(fixRequests.userId, user.id)))
    .limit(1);

  if (!fix) return c.json({ error: "Fix request not found" }, 404);
  if (fix.status !== "preview_ready") {
    return c.json({ error: "Fix is not ready for approval" }, 400);
  }

  // Update status and fire-and-forget deployment
  const [updated] = await db
    .update(fixRequests)
    .set({ status: "approved", updatedAt: new Date() })
    .where(eq(fixRequests.id, id))
    .returning();

  deployFix(id).catch((err) => {
    console.error(`[fixes] Deploy failed for ${id}:`, err);
  });

  return c.json(updated);
});

// POST /api/fixes/:id/reject - Reject preview, discard branch
fixRoutes.post("/:id/reject", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const [fix] = await db
    .select()
    .from(fixRequests)
    .where(and(eq(fixRequests.id, id), eq(fixRequests.userId, user.id)))
    .limit(1);

  if (!fix) return c.json({ error: "Fix request not found" }, 404);
  if (fix.status !== "preview_ready") {
    return c.json({ error: "Fix is not in a rejectable state" }, 400);
  }

  // Clean up and reject
  rejectFixPipeline(id).catch((err) => {
    console.error(`[fixes] Reject cleanup failed for ${id}:`, err);
  });

  return c.json({ message: "Fix rejected", fixId: id });
});

export default fixRoutes;
