import "server-only";

import { InvitationError } from "@/features/auth/invite/errors";
import { createAdminClient } from "@/lib/supabase/admin";

export async function authUserExistsByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
) {
  const { data, error } = await admin.rpc("auth_user_exists_by_email", {
    p_email: email,
  });

  if (error) {
    console.error("auth_user_exists_by_email failed", error.message);
    throw new InvitationError("Failed to verify email availability.");
  }

  return Boolean(data);
}
