/**
 * Authentication foundation surface (Sprint 001 + Sprint 003).
 *
 * Session / guards are server-only — import from:
 * - `@/lib/auth/session`
 * - `@/lib/auth/guards`
 *
 * Existing auth flows remain in `core/auth` and `features/auth`.
 * Middleware session refresh remains in `src/middleware.ts`
 * via `@/lib/supabase/middleware`.
 */
export const authConfig = {
  loginPath: "/login",
  callbackPath: "/auth/callback",
  updatePasswordPath: "/auth/update-password",
  inviteAcceptPath: "/invite/accept",
} as const;

export {
  AUTH_ROLES,
  AUTH_ROLE_KEYS,
  AUTH_ROLE_DEFINITIONS,
  type AuthRole,
  type AuthRoleKey,
  type AuthRoleDefinition,
} from "./roles";

export {
  AUTH_PERMISSION_ACTIONS,
  AUTH_PERMISSION_RESOURCES,
  type AuthPermissionAction,
  type AuthPermissionResource,
  type AuthPermissionKey,
  type AuthPermissionDefinition,
  type AuthPermissionSet,
} from "./permissions";
