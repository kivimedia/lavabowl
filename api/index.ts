/**
 * Vercel serverless entry point.
 * Delegates all /api/* requests to the Hono app.
 */
import { Hono } from "hono";
import { handle } from "hono/vercel";

// Minimal test to verify function works
const testApp = new Hono();
testApp.get("/api/health", (c) => c.json({ status: "ok", source: "vercel-serverless" }));
testApp.all("/api/*", (c) => c.json({ error: "Not found", path: c.req.path }, 404));

// Try importing the full app, fall back to test app on error
let app: Hono;
try {
  const mod = await import("../server/src/app.js");
  app = mod.app;
  console.log("Full app loaded successfully");
} catch (err) {
  console.error("Failed to load full app:", err);
  app = testApp;
}

export default handle(app);
