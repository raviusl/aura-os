/**
 * Foundation session shapes (Sprint 003).
 * Types only — session loading lives in lib/auth/session and core/auth.
 */
export type AuthSessionUser = {
  id: string;
  email: string | null;
};

export type AuthSession = {
  user: AuthSessionUser | null;
};

export type AuthenticatedSession = {
  user: AuthSessionUser;
};
