export type AuthUser = {
  id: string;
  email: string | null;
};

/**
 * Platform-level role. Distinct from Workspace Team roles in DATA_MODEL.md.
 * Super Admin is the only principal allowed to invite users.
 */
export type PlatformRole = "super_admin" | "member";
