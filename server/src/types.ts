import type { AuthUser } from "./middleware/auth.js";

// Hono context variables type - used across all routes
export type AppVariables = {
  user: AuthUser;
};
