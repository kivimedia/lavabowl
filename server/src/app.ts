/**
 * Hono app instance (shared between local dev server and Vercel serverless).
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { errorHandler } from "./middleware/error-handler.js";
import { generalRateLimit, authRateLimit, webhookRateLimit } from "./middleware/rate-limit.js";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import fixRoutes from "./routes/fixes.js";
import deploymentRoutes from "./routes/deployments.js";
import billingRoutes from "./routes/billing.js";
import webhookRoutes from "./routes/webhooks.js";

export const app = new Hono();

// Global error handler (catches all uncaught errors)
app.use("*", errorHandler);

// Logging
app.use("*", logger());

// CORS
app.use(
  "/api/*",
  cors({
    origin: process.env.APP_URL || "http://localhost:8080",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Rate limiting
app.use("/api/auth/*", authRateLimit);
app.use("/api/webhooks/*", webhookRateLimit);
app.use("/api/*", generalRateLimit);

// Health check
app.get("/api/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// API Routes
app.route("/api/auth", authRoutes);
app.route("/api/projects", projectRoutes);
app.route("/api/fixes", fixRoutes);
app.route("/api/deployments", deploymentRoutes);
app.route("/api/billing", billingRoutes);
app.route("/api/webhooks", webhookRoutes);
