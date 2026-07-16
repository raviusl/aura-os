import "server-only";

import type { User } from "@supabase/supabase-js";

import type { PlatformRole } from "@/features/auth/types";

/**
 * Resolves platform role for the given Auth user.
 * Server-only: reads SUPER_ADMIN_EMAILS.
 */
export function getPlatformRole(user: User | null | undefined): PlatformRole {
  if (!user) return "member";
  if (user.app_metadata?.role === "super_admin") return "super_admin";

  const email = user.email?.toLowerCase();
  if (email && getSuperAdminEmailAllowlist().includes(email)) {
    return "super_admin";
  }

  return "member";
}

export function isSuperAdmin(user: User | null | undefined): boolean {
  return getPlatformRole(user) === "super_admin";
}

function getSuperAdminEmailAllowlist(): string[] {
  const raw = process.env.SUPER_ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}
