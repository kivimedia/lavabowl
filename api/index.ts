/**
 * Vercel serverless entry point.
 * Delegates all /api/* requests to the Hono app.
 */
import { handle } from "hono/vercel";
import { app } from "../server/src/app";

export default handle(app);
