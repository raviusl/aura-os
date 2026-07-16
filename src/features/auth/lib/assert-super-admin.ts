import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSuperAdmin } from "@/features/auth/types";

/**
 * Ensures the current session belongs to a Super Admin.
 * Used by invite (and future admin) server operations.
 */
export async function assertSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user || !isSuperAdmin(user)) {
    throw new Error("Only Super Admins can perform this action.");
  }

  return user;
}
