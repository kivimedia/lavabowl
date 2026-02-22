import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";

// Minimal Hono app for Vercel serverless
// This will be expanded to import full server routes once basic function works
const app = new Hono().basePath("/api");

// CORS
app.use(
  "*",
  cors({
    origin: [
      "https://lavabowl.com",
      "https://www.lavabowl.com",
      "http://localhost:8080",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Health check
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString(), env: "vercel" })
);

// Catch-all for debugging
app.all("/*", (c) =>
  c.json({ msg: "api works", path: c.req.path, method: c.req.method })
);

export default handle(app);
