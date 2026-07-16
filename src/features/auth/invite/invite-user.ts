import "server-only";

import {
  inviteUserSchema,
  type InviteUserInput,
} from "@/features/auth/schemas/auth";
import type { InviteUserResult } from "@/features/auth/types";
import { assertSuperAdmin } from "@/features/auth/lib/assert-super-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig } from "@/config/site";

/**
 * Invitation-only user provisioning (architecture stub).
 *
 * Flow (future UI):
 * Super Admin → Invite User → Email Invitation → User Creates Password → Login
 *
 * No public Sign Up. Callers must be Super Admins.
 * Do not expose this from Client Components.
 */
export async function inviteUser(
  input: InviteUserInput,
): Promise<InviteUserResult> {
  const values = inviteUserSchema.parse(input);
  await assertSuperAdmin();

  const admin = createAdminClient();
  const appUrl = siteConfig.url.replace(/\/$/, "");

  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    values.email,
    {
      data: {
        full_name: values.fullName,
        display_name: values.fullName,
      },
      redirectTo: `${appUrl}/auth/callback?next=/auth/update-password`,
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Invite failed: no user returned.");
  }

  return {
    userId: data.user.id,
    email: data.user.email ?? values.email,
  };
}
