import "server-only";

import { assertSuperAdmin } from "@/features/auth/lib/assert-super-admin";
import {
  generateInvitationToken,
  hashInvitationToken,
} from "@/features/auth/lib/invitation-token";
import { requireAppUrl } from "@/features/auth/lib/require-app-url";
import { authUserExistsByEmail } from "@/features/auth/invite/auth-user-exists";
import { writeInvitationAuditLog } from "@/features/auth/invite/audit";
import { deliverInvitationEmail } from "@/features/auth/invite/deliver-invitation-email";
import { InvitationError } from "@/features/auth/invite/errors";
import {
  isInvitationExpired,
  markInvitationsExpired,
} from "@/features/auth/invite/expire-invitations";
import type { InviteUserResult } from "@/features/auth/invite/invite-user";
import {
  INVITATION_TTL_HOURS,
  type InviteRole,
} from "@/features/auth/schemas/invite";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Re-issues an expired invitation with a fresh token and 72h window.
 * Does not change accept / password authentication logic.
 */
export async function resendInvitation(
  invitationId: string,
): Promise<InviteUserResult> {
  const actor = await assertSuperAdmin();
  const admin = createAdminClient();
  const appUrl = requireAppUrl();

  const { data: invitation, error } = await admin
    .from("invitations")
    .select("*")
    .eq("id", invitationId)
    .maybeSingle();

  if (error) {
    console.error("resend invitation load failed", error.message);
    throw new InvitationError("Failed to resend invitation.");
  }
  if (!invitation) {
    throw new InvitationError("Invitation not found.");
  }

  if (invitation.status === "pending" && isInvitationExpired(invitation.expires_at)) {
    await markInvitationsExpired({
      ids: [invitation.id],
      reason: "auto_expired_before_resend",
      actorId: actor.id,
    });
    invitation.status = "expired";
  }

  if (invitation.status !== "expired") {
    throw new InvitationError("Only expired invitations can be resent.");
  }

  if (await authUserExistsByEmail(admin, invitation.email)) {
    throw new InvitationError("A user with this email already exists.");
  }

  const { data: otherPending, error: pendingError } = await admin
    .from("invitations")
    .select("id")
    .eq("email", invitation.email)
    .eq("status", "pending")
    .neq("id", invitation.id)
    .maybeSingle();

  if (pendingError) {
    console.error("resend pending check failed", pendingError.message);
    throw new InvitationError("Failed to resend invitation.");
  }
  if (otherPending) {
    throw new InvitationError(
      "A pending invitation already exists for this email. Cancel it before resending.",
    );
  }

  const token = generateInvitationToken();
  const tokenHash = hashInvitationToken(token);
  const expiresAt = new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);
  const inviteUrl = `${appUrl}/invite/accept?token=${encodeURIComponent(token)}`;

  const { data: updated, error: updateError } = await admin
    .from("invitations")
    .update({
      token_hash: tokenHash,
      status: "pending",
      expires_at: expiresAt.toISOString(),
      accepted_at: null,
      accepted_user_id: null,
    })
    .eq("id", invitation.id)
    .eq("status", "expired")
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    console.error("resend invitation update failed", updateError?.message);
    throw new InvitationError("Failed to resend invitation.");
  }

  await writeInvitationAuditLog({
    invitationId: invitation.id,
    action: "resent",
    actorId: actor.id,
    metadata: {
      email: invitation.email,
      expires_at: expiresAt.toISOString(),
    },
  });

  const delivery = await deliverInvitationEmail({
    invitationId: invitation.id,
    actorId: actor.id,
    to: invitation.email,
    fullName: invitation.full_name,
    company: invitation.company,
    role: invitation.role as InviteRole,
    inviteUrl,
    expiresAt,
    successAction: "emailed",
  });

  return {
    invitationId: invitation.id,
    email: invitation.email,
    expiresAt: expiresAt.toISOString(),
    emailSent: delivery.emailSent,
    inviteUrl: delivery.inviteUrl,
    emailWarning: delivery.emailWarning,
  };
}
