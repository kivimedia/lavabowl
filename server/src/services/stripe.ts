import Stripe from "stripe";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia" as any,
});

export { stripe };

/**
 * Create a Stripe customer and link to our user record
 */
export async function createOrGetCustomer(userId: string, email: string, name?: string | null): Promise<string> {
  // Check if user already has a Stripe customer ID
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create Stripe customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { lavabowl_user_id: userId },
  });

  // Save to DB
  await db
    .update(users)
    .set({ stripeCustomerId: customer.id, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return customer.id;
}

/**
 * Create a Checkout Session for the $5/mo hosting subscription
 */
export async function createHostingCheckout(customerId: string, projectId: string): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_HOSTING_MONTHLY,
        quantity: 1,
      },
    ],
    success_url: `${process.env.APP_URL}/get-started?step=6&project_id=${projectId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/get-started?step=5&cancelled=true`,
    metadata: {
      type: "hosting",
      project_id: projectId,
    },
  });
  return session;
}

/**
 * Create a PaymentIntent for a fix charge
 */
export async function createFixPaymentIntent(
  customerId: string,
  fixRequestId: string,
  amountInCents: number
): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.create({
    customer: customerId,
    amount: amountInCents,
    currency: "usd",
    automatic_payment_methods: { enabled: true },
    metadata: {
      type: "fix",
      fix_request_id: fixRequestId,
    },
  });
  return paymentIntent;
}

/**
 * Calculate fix price based on user's fix count
 * First 30 fixes: $3 each (300 cents)
 * After 30: $5 each (500 cents)
 */
export function getFixPrice(fixCount: number): number {
  return fixCount < 30 ? 300 : 500;
}

/**
 * Create a Stripe Customer Portal session
 */
export async function createPortalSession(customerId: string): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.APP_URL}/dashboard`,
  });
  return session;
}

/**
 * Get customer invoices
 */
export async function getStripeInvoices(customerId: string): Promise<Stripe.Invoice[]> {
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit: 50,
  });
  return invoices.data;
}
