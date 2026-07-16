import "server-only";

import { isSuperAdmin } from "@/features/auth/lib/platform-role";
import { getSessionUser } from "@/features/auth/lib/get-session-user";

/**
 * Ensures the current session belongs to a Super Admin.
 * Used by invite (and future admin) server operations.
 */
export async function assertSuperAdmin() {
  const user = await getSessionUser();

  if (!user || !isSuperAdmin(user)) {
    throw new Error("Only Super Admins can perform this action.");
  }

  return user;
}
