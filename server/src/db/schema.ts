import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ============================================================
// Enums
// ============================================================

export const projectStatusEnum = pgEnum("project_status", [
  "onboarding",
  "migrating",
  "active",
  "suspended",
  "deleted",
]);

export const fixStatusEnum = pgEnum("fix_status", [
  "submitted",
  "triaging",
  "quoted",
  "awaiting_payment",
  "in_progress",
  "preview_ready",
  "approved",
  "deploying",
  "deployed",
  "rejected",
  "out_of_scope",
  "failed",
]);

export const fixComplexityEnum = pgEnum("fix_complexity", [
  "simple",
  "complex",
  "out_of_scope",
]);

export const deploymentStatusEnum = pgEnum("deployment_status", [
  "queued",
  "building",
  "ready",
  "error",
  "cancelled",
]);

// ============================================================
// Tables
// ============================================================

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    supabaseUserId: text("supabase_user_id").notNull().unique(),
    email: text("email").notNull(),
    fullName: text("full_name"),
    stripeCustomerId: text("stripe_customer_id"),
    fixCount: integer("fix_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("users_supabase_id_idx").on(table.supabaseUserId),
    uniqueIndex("users_email_idx").on(table.email),
  ]
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: projectStatusEnum("status").notNull().default("onboarding"),

    // GitHub
    githubRepoUrl: text("github_repo_url"),
    githubRepoFullName: text("github_repo_full_name"), // e.g. "user/repo"

    // Supabase (customer's Supabase, not ours)
    supabaseUrl: text("supabase_url"),
    supabaseAnonKey: text("supabase_anon_key"),

    // Vercel
    vercelProjectId: text("vercel_project_id"),
    vercelDeploymentUrl: text("vercel_deployment_url"),

    // Domain
    subdomain: text("subdomain").unique(),
    customDomain: text("custom_domain"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("projects_user_id_idx").on(table.userId),
    uniqueIndex("projects_subdomain_idx").on(table.subdomain),
  ]
);

export const fixRequests = pgTable(
  "fix_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    status: fixStatusEnum("status").notNull().default("submitted"),
    complexity: fixComplexityEnum("complexity"),
    priceInCents: integer("price_in_cents"),

    // Stripe
    stripePaymentIntentId: text("stripe_payment_intent_id"),

    // AI results
    triageResult: jsonb("triage_result"), // { complexity, reasoning, estimatedFiles, suggestedApproach }
    aiFix: jsonb("ai_fix"), // { files: [{path, content, action}], explanation }

    // Git/Deploy
    stagingBranch: text("staging_branch"),
    previewUrl: text("preview_url"),
    errorLog: text("error_log"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("fix_requests_project_id_idx").on(table.projectId),
    index("fix_requests_user_id_idx").on(table.userId),
    index("fix_requests_status_idx").on(table.status),
  ]
);

export const deployments = pgTable(
  "deployments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    vercelDeploymentId: text("vercel_deployment_id"),
    commitHash: text("commit_hash"),
    commitMessage: text("commit_message"),
    branch: text("branch").notNull().default("main"),
    status: deploymentStatusEnum("status").notNull().default("queued"),
    url: text("url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("deployments_project_id_idx").on(table.projectId),
  ]
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id),
    stripeInvoiceId: text("stripe_invoice_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    type: text("type").notNull(), // 'subscription' | 'fix' | 'migration'
    description: text("description"),
    amountInCents: integer("amount_in_cents").notNull(),
    status: text("status").notNull(), // 'paid' | 'pending' | 'failed'
    fixRequestId: uuid("fix_request_id").references(() => fixRequests.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("invoices_user_id_idx").on(table.userId),
    index("invoices_project_id_idx").on(table.projectId),
  ]
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
    status: text("status").notNull(), // 'active' | 'canceled' | 'past_due' | 'trialing'
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("subscriptions_user_id_idx").on(table.userId),
    index("subscriptions_project_id_idx").on(table.projectId),
    uniqueIndex("subscriptions_stripe_id_idx").on(table.stripeSubscriptionId),
  ]
);
