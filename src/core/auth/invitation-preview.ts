import "server-only";

import { authUserExistsByEmail } from "@/core/auth/auth-user-exists";
import { CoreError } from "@/core/errors";
import { hashCoreInvitationToken } from "@/core/lib/invitation-token";
import type { CoreInvitation } from "@/core/types";
import { getWorkspaceById } from "@/core/workspace/workspace";
import { createAdminClient } from "@/lib/supabase/admin";

export type CoreInvitationPreview = {
  email: string;
  fullName: string;
  role: string;
  workspaceId: string;
  workspaceName: string;
  expiresAt: string;
  /** True when an Auth account already exists for this email (join flow). */
  existingAccount: boolean;
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
  if (invitation.status === "rejected") {
    throw new CoreError(
      "INVITATION_REJECTED",
      "This invitation was rejected.",
    );
  }
  if (
    invitation.status === "expired" ||
    new Date(invitation.expires_at).getTime() <= Date.now()
  ) {
    if (invitation.status === "pending") {
      await admin
        .from("core_invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id)
        .eq("status", "pending");
    }
    throw new CoreError("INVITATION_EXPIRED", "This invitation has expired.");
  }

  const workspace = await getWorkspaceById(invitation.workspace_id);
  const existingAccount = await authUserExistsByEmail(invitation.email);

  return {
    email: invitation.email,
    fullName: invitation.full_name,
    role: invitation.role_key,
    workspaceId: invitation.workspace_id,
    workspaceName: workspace.name,
    expiresAt: invitation.expires_at,
    existingAccount,
  };
}
