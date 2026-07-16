import type { User } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email: string | null;
};

/**
 * Platform-level role. Distinct from Workspace Team roles in DATA_MODEL.md.
 * Super Admin is the only principal allowed to invite users.
 */
export type PlatformRole = "super_admin" | "member";

export type InviteUserResult = {
  userId: string;
  email: string;
};

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
