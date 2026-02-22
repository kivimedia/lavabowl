import { Hono } from "hono";
import { db } from "../db/index.js";
import { subscriptions, invoices } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import {
  createOrGetCustomer,
  createHostingCheckout,
  createPortalSession,
  getStripeInvoices,
  getFixPrice,
} from "../services/stripe.js";
import { createCheckoutSchema } from "../lib/validators.js";
import type { AppVariables } from "../types.js";

const billingRoutes = new Hono<{ Variables: AppVariables }>();

billingRoutes.use("*", authMiddleware);

// GET /api/billing/status - Current subscription + fix credits
billingRoutes.get("/status", async (c) => {
  const user = c.get("user");

  // Get active subscriptions
  const subs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .orderBy(sql`${subscriptions.createdAt} DESC`);

  const activeSub = subs.find((s) => s.status === "active");

  return c.json({
    hasActiveSubscription: !!activeSub,
    subscription: activeSub || null,
    fixCount: user.fixCount,
    currentFixPrice: getFixPrice(user.fixCount),
    standardFixesRemaining: Math.max(0, 30 - user.fixCount),
  });
});

// GET /api/billing/invoices - Invoice history
billingRoutes.get("/invoices", async (c) => {
  const user = c.get("user");

  // Get invoices from our DB
  const dbInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.userId, user.id))
    .orderBy(sql`${invoices.createdAt} DESC`)
    .limit(50);

  return c.json(dbInvoices);
});

// GET /api/billing/fix-price - Current fix price based on count
billingRoutes.get("/fix-price", async (c) => {
  const user = c.get("user");
  const price = getFixPrice(user.fixCount);
  return c.json({
    priceInCents: price,
    priceFormatted: `$${(price / 100).toFixed(0)}`,
    fixCount: user.fixCount,
    isStandardRate: user.fixCount < 30,
  });
});

// POST /api/billing/create-checkout - Create Stripe Checkout session
billingRoutes.post("/create-checkout", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const parsed = createCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid input", details: parsed.error.flatten() }, 400);
  }

  try {
    const customerId = await createOrGetCustomer(user.id, user.email, user.fullName);
    const session = await createHostingCheckout(customerId, parsed.data.projectId);
    return c.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Checkout creation error:", err);
    return c.json({ error: "Failed to create checkout session" }, 500);
  }
});

// POST /api/billing/create-portal - Create Stripe Customer Portal session
billingRoutes.post("/create-portal", async (c) => {
  const user = c.get("user");

  if (!user.stripeCustomerId) {
    return c.json({ error: "No billing account found" }, 400);
  }

  try {
    const session = await createPortalSession(user.stripeCustomerId);
    return c.json({ url: session.url });
  } catch (err) {
    console.error("Portal creation error:", err);
    return c.json({ error: "Failed to create portal session" }, 500);
  }
});

export default billingRoutes;
