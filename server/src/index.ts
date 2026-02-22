// Load env vars FIRST — before any other imports that reference process.env
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../.env") });

// Now safe to import app (which imports db, routes, etc.)
const { app } = await import("./app.js");

import { serve } from "@hono/node-server";

// Start local dev server
const port = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port }, () => {
  console.log(`🌋 LavaBowl API running on http://localhost:${port}`);
});

export default app;
