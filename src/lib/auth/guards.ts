import "server-only";

import { getAuthSession } from "@/lib/auth/session";
import type { AuthenticatedSession } from "@/types/auth/Session";

/**
 * Authentication guards (Sprint 003 foundation).
 * Session presence only — no role / permission / business checks.
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession();
  return session.user != null;
}

/**
 * Requires a signed-in Auth user.
 * Throws when unauthenticated. Does not evaluate roles or permissions.
 */
export async function requireAuthenticated(): Promise<AuthenticatedSession> {
  const session = await getAuthSession();
  if (!session.user) {
    throw new Error("UNAUTHENTICATED");
  }
  return { user: session.user };
}
