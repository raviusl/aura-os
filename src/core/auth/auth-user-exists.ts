import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/** Service-role email existence check (Sprint 007 RPC). */
export async function authUserExistsByEmail(email: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("auth_user_exists_by_email", {
    p_email: email.trim().toLowerCase(),
  });

  if (error) {
    console.error("auth_user_exists_by_email failed", error.message);
    return false;
  }

  return Boolean(data);
}
