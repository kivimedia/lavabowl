import { Context, Next } from "hono";
import { createClient } from "@supabase/supabase-js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Create Supabase admin client for verifying tokens
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export interface AuthUser {
  id: string;
  supabaseUserId: string;
  email: string;
  fullName: string | null;
  stripeCustomerId: string | null;
  fixCount: number;
}

/**
 * Auth middleware that verifies Supabase JWT and attaches the DB user to context.
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid authorization header" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    // Verify token with Supabase
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    // Look up user in our database
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.supabaseUserId, supabaseUser.id))
      .limit(1);

    if (!dbUser) {
      return c.json({ error: "User not found. Please complete registration." }, 401);
    }

    // Attach user to context
    c.set("user", dbUser as AuthUser);
    await next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return c.json({ error: "Authentication failed" }, 401);
  }
}
