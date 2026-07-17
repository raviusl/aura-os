/**
 * Foundation authentication roles (Sprint 003).
 * Definition only — no permission mapping or enforcement.
 */
export const AUTH_ROLES = [
  "Owner",
  "Admin",
  "Manager",
  "Member",
  "Viewer",
] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export const AUTH_ROLE_KEYS = {
  Owner: "owner",
  Admin: "admin",
  Manager: "manager",
  Member: "member",
  Viewer: "viewer",
} as const satisfies Record<AuthRole, string>;

export type AuthRoleKey = (typeof AUTH_ROLE_KEYS)[AuthRole];

export type AuthRoleDefinition = {
  key: AuthRoleKey;
  name: AuthRole;
  description: string;
};

export const AUTH_ROLE_DEFINITIONS: readonly AuthRoleDefinition[] = [
  {
    key: AUTH_ROLE_KEYS.Owner,
    name: "Owner",
    description: "Full control of the workspace and membership.",
  },
  {
    key: AUTH_ROLE_KEYS.Admin,
    name: "Admin",
    description: "Administrative access to workspace settings and members.",
  },
  {
    key: AUTH_ROLE_KEYS.Manager,
    name: "Manager",
    description: "Operational management across projects and teams.",
  },
  {
    key: AUTH_ROLE_KEYS.Member,
    name: "Member",
    description: "Standard collaborator access within assigned scope.",
  },
  {
    key: AUTH_ROLE_KEYS.Viewer,
    name: "Viewer",
    description: "Read-only access to permitted resources.",
  },
] as const;
