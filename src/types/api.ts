// Shared API types matching the backend schema

export interface User {
  id: string;
  supabaseUserId: string;
  email: string;
  fullName: string | null;
  stripeCustomerId: string | null;
  fixCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  status: ProjectStatus;
  githubRepoUrl: string | null;
  githubRepoFullName: string | null;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  vercelProjectId: string | null;
  vercelDeploymentUrl: string | null;
  subdomain: string | null;
  customDomain: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus =
  | "onboarding"
  | "migrating"
  | "active"
  | "suspended"
  | "deleted";

export interface FixRequest {
  id: string;
  projectId: string;
  userId: string;
  description: string;
  status: FixStatus;
  complexity: FixComplexity | null;
  priceInCents: number | null;
  stripePaymentIntentId: string | null;
  triageResult: Record<string, unknown> | null;
  aiFix: Record<string, unknown> | null;
  stagingBranch: string | null;
  previewUrl: string | null;
  errorLog: string | null;
  createdAt: string;
  updatedAt: string;
}

export type FixStatus =
  | "submitted"
  | "triaging"
  | "quoted"
  | "awaiting_payment"
  | "in_progress"
  | "preview_ready"
  | "approved"
  | "deploying"
  | "deployed"
  | "rejected"
  | "failed"
  | "refunded";

export type FixComplexity = "simple" | "complex" | "out_of_scope";

export interface Deployment {
  id: string;
  projectId: string;
  vercelDeploymentId: string | null;
  commitHash: string | null;
  commitMessage: string | null;
  branch: string | null;
  status: DeploymentStatus;
  url: string | null;
  createdAt: string;
}

export type DeploymentStatus =
  | "queued"
  | "building"
  | "ready"
  | "error"
  | "canceled";

export interface Invoice {
  id: string;
  userId: string;
  projectId: string | null;
  stripeInvoiceId: string | null;
  stripePaymentIntentId: string | null;
  type: string;
  description: string | null;
  amountInCents: number;
  status: string;
  fixRequestId: string | null;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  projectId: string;
  stripeSubscriptionId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  totalFixes: number;
  completedFixes: number;
  totalDeployments: number;
  successfulDeployments: number;
}

export interface BillingStatus {
  subscriptions: Subscription[];
  fixCount: number;
  currentFixPrice: number;
  standardFixesRemaining: number;
}

export interface FixPriceInfo {
  priceInCents: number;
  priceFormatted: string;
  fixCount: number;
  isStandardRate: boolean;
}
