import "server-only";

import { CoreError } from "@/core/errors";
import { hashCoreInvitationToken } from "@/core/lib/invitation-token";
import type { CoreInvitation } from "@/core/types";
import { createAdminClient } from "@/lib/supabase/admin";

export type CoreInvitationPreview = {
  email: string;
  fullName: string;
  role: string;
  workspaceId: string;
  expiresAt: string;
};

export async function getCoreInvitationPreview(
  token: string,
): Promise<CoreInvitationPreview> {
  const admin = createAdminClient();
  const tokenHash = hashCoreInvitationToken(token);

  const { data, error } = await admin
    .from("core_invitations")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    console.error("getCoreInvitationPreview failed", error.message);
    throw new CoreError(
      "INVITATION_INVALID",
      "Invitation not found or invalid.",
    );
  }
  if (!data) {
    throw new CoreError(
      "INVITATION_INVALID",
      "Invitation not found or invalid.",
    );
  }

  const invitation = data as CoreInvitation;

  if (invitation.status === "accepted") {
    throw new CoreError(
      "INVITATION_USED",
      "This invitation has already been used.",
    );
  }
  if (invitation.status === "revoked") {
    throw new CoreError(
      "INVITATION_REVOKED",
      "This invitation has been revoked.",
    );
  }
  if (
    invitation.status === "expired" ||
    new Date(invitation.expires_at).getTime() <= Date.now()
  ) {
    throw new CoreError("INVITATION_EXPIRED", "This invitation has expired.");
  }

  return {
    email: invitation.email,
    fullName: invitation.full_name,
    role: invitation.role_key,
    workspaceId: invitation.workspace_id,
    expiresAt: invitation.expires_at,
  };
}
