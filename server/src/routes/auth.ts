import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import type { AppVariables } from "../types.js";

const auth = new Hono<{ Variables: AppVariables }>();

const registerSchema = z.object({
  supabaseUserId: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().nullable().optional(),
});

// POST /api/auth/register - Create user in Neon after Supabase signup
auth.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: "Invalid request body", details: parsed.error.flatten() }, 400);
    }

    const { supabaseUserId, email, fullName } = parsed.data;

    // Check if user already exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.supabaseUserId, supabaseUserId))
      .limit(1);

    if (existing) {
      return c.json(existing);
    }

    // Create new user
    const [newUser] = await db
      .insert(users)
      .values({
        supabaseUserId,
        email,
        fullName: fullName ?? null,
      })
      .returning();

    return c.json(newUser, 201);
  } catch (err) {
    console.error("Register error:", err);
    return c.json({ error: "Failed to register user" }, 500);
  }
});

// GET /api/auth/me - Get current user profile (requires auth)
auth.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json(user);
});

export default auth;
