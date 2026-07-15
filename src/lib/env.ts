import { z } from "zod";

/**
 * Public env vars are safe to expose to the browser.
 * Server-only secrets must never use the NEXT_PUBLIC_ prefix.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL",
  }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required",
  }),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function readPublicEnv() {
  return {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(
      /\/$/,
      "",
    ),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

/**
 * Validates and returns public env. Call at use-sites (clients, layouts),
 * not at module top-level, so builds succeed before secrets are wired.
 */
export function getPublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse(readPublicEnv());

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid public environment variables. ${details}`);
  }

  return parsed.data;
}

/**
 * Validates and returns server env (includes optional service role key).
 * Never import this module from Client Components.
 */
export function getServerEnv(): ServerEnv {
  const parsed = serverEnvSchema.safeParse({
    ...readPublicEnv(),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid server environment variables. ${details}`);
  }

  return parsed.data;
}
