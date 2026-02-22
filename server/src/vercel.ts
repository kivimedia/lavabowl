/**
 * Vercel serverless entry point for the Hono API.
 * This wraps the Hono server for deployment on Vercel's Edge/Node runtime.
 */

import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../.env") });

import { handle } from "hono/vercel";
import { app } from "./app.js";

export default handle(app);
