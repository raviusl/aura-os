/**
 * Supabase Auth configuration surface (Sprint 001 foundation).
 * Auth flows are implemented in core/auth and features/auth.
 */
export const authConfig = {
  loginPath: "/login",
  callbackPath: "/auth/callback",
  updatePasswordPath: "/auth/update-password",
  inviteAcceptPath: "/invite/accept",
} as const;
