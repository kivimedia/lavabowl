import { Hono } from "hono";
import { stripe } from "../services/stripe.js";
import { db } from "../db/index.js";
import { subscriptions, projects, invoices, fixRequests, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

const webhookRoutes = new Hono();

// POST /api/webhooks/stripe - Stripe webhook handler
// Note: Must use raw body for signature verification
webhookRoutes.post("/stripe", async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header("stripe-signature");

  if (!signature) {
    return c.json({ error: "Missing stripe-signature header" }, 400);
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return c.json({ error: "Invalid signature" }, 400);
  }

  console.log(`Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error handling webhook ${event.type}:`, err);
    // Still return 200 to Stripe to avoid retries on internal errors
  }

  return c.json({ received: true });
});

// ===== Webhook Handlers =====

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};

  if (metadata.type === "hosting" && session.subscription) {
    const subscriptionId = typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;

    // Get the Stripe subscription details
    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

    // Find the user by Stripe customer ID
    const customerId = typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

    if (!customerId) return;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId))
      .limit(1);

    if (!user) {
      console.error("No user found for customer:", customerId);
      return;
    }

    // Create subscription record
    const periodStart = (stripeSub as any).current_period_start;
    const periodEnd = (stripeSub as any).current_period_end;
    await db.insert(subscriptions).values({
      userId: user.id,
      projectId: metadata.project_id,
      stripeSubscriptionId: subscriptionId,
      status: stripeSub.status,
      currentPeriodStart: periodStart ? new Date(periodStart * 1000) : new Date(),
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : new Date(),
    });

    // Activate the project
    if (metadata.project_id) {
      await db
        .update(projects)
        .set({ status: "migrating", updatedAt: new Date() })
        .where(eq(projects.id, metadata.project_id));
    }
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string"
    ? invoice.customer
    : invoice.customer?.id;

  if (!customerId) return;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user) return;

  // Record the invoice in our DB
  await db.insert(invoices).values({
    userId: user.id,
    stripeInvoiceId: invoice.id,
    type: "subscription",
    description: invoice.description || "Monthly hosting",
    amountInCents: invoice.amount_paid,
    status: "paid",
  }).onConflictDoNothing();
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const sub = (invoice as any).subscription;
  const subscriptionId = typeof sub === "string"
    ? sub
    : sub?.id;

  if (!subscriptionId) return;

  await db
    .update(subscriptions)
    .set({ status: "past_due", updatedAt: new Date() })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const periodStart = (subscription as any).current_period_start;
  const periodEnd = (subscription as any).current_period_end;
  await db
    .update(subscriptions)
    .set({
      status: subscription.status,
      currentPeriodStart: periodStart ? new Date(periodStart * 1000) : new Date(),
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await db
    .update(subscriptions)
    .set({ status: "canceled", updatedAt: new Date() })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  // Suspend the project
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (sub) {
    await db
      .update(projects)
      .set({ status: "suspended", updatedAt: new Date() })
      .where(eq(projects.id, sub.projectId));
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const metadata = paymentIntent.metadata || {};

  if (metadata.type === "fix" && metadata.fix_request_id) {
    // Update fix request status
    await db
      .update(fixRequests)
      .set({
        status: "in_progress",
        stripePaymentIntentId: paymentIntent.id,
        updatedAt: new Date(),
      })
      .where(eq(fixRequests.id, metadata.fix_request_id));

    // Increment user's fix count
    const [fix] = await db
      .select()
      .from(fixRequests)
      .where(eq(fixRequests.id, metadata.fix_request_id))
      .limit(1);

    if (fix) {
      await db
        .update(users)
        .set({
          fixCount: (await db.select().from(users).where(eq(users.id, fix.userId)).limit(1))[0].fixCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(users.id, fix.userId));

      // Record invoice
      await db.insert(invoices).values({
        userId: fix.userId,
        projectId: fix.projectId,
        stripePaymentIntentId: paymentIntent.id,
        type: "fix",
        description: `Fix: ${fix.description.slice(0, 100)}`,
        amountInCents: paymentIntent.amount,
        status: "paid",
        fixRequestId: fix.id,
      });

      // TODO: Phase 9 - Trigger executeFix(fix.id) here
      console.log(`Fix payment succeeded for ${fix.id} - ready to execute fix pipeline`);
    }
  }
}

// POST /api/webhooks/vercel - Vercel deployment webhook
webhookRoutes.post("/vercel", async (c) => {
  // TODO: Phase 10 - Implement Vercel webhook handling
  const body = await c.req.json();
  console.log("Vercel webhook:", body.type);
  return c.json({ received: true });
});

export default webhookRoutes;
