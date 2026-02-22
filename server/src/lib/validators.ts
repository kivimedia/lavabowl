import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  githubRepoUrl: z.string().url().optional(),
  supabaseUrl: z.string().url().optional(),
  supabaseAnonKey: z.string().optional(),
  subdomain: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Subdomain must be lowercase alphanumeric with hyphens only")
    .optional(),
  customDomain: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  supabaseUrl: z.string().url().optional(),
  supabaseAnonKey: z.string().optional(),
  subdomain: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  customDomain: z.string().optional(),
});

export const submitFixSchema = z.object({
  description: z.string().min(10).max(5000),
});

export const createCheckoutSchema = z.object({
  projectId: z.string().uuid(),
});
