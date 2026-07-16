import "server-only";

import { writeInvitationAuditLog } from "@/features/auth/invite/audit";
import { sendInvitationEmail } from "@/features/auth/lib/send-invitation-email";
import { INVITE_ROLE_LABELS, type InviteRole } from "@/features/auth/schemas/invite";
import { createAdminClient } from "@/lib/supabase/admin";

export type DeliverInvitationEmailResult = {
  emailSent: boolean;
  inviteUrl?: string;
  emailWarning?: string;
};

/**
 * Sends the invitation email and writes emailed / email_failed audit rows.
 * Never stores the invite URL or raw token in audit metadata.
 */
export async function deliverInvitationEmail(input: {
  invitationId: string;
  actorId: string;
  to: string;
  fullName: string;
  company: string;
  role: InviteRole;
  inviteUrl: string;
  expiresAt: Date;
  /** Audit action after a successful send (default emailed). */
  successAction?: "emailed" | "resent";
}): Promise<DeliverInvitationEmailResult> {
  const admin = createAdminClient();
  const emailResult = await sendInvitationEmail({
    to: input.to,
    fullName: input.fullName,
    company: input.company,
    roleLabel: INVITE_ROLE_LABELS[input.role].en,
    inviteUrl: input.inviteUrl,
    expiresAt: input.expiresAt,
  });

  if (emailResult.ok) {
    await admin
      .from("invitations")
      .update({ last_sent_at: new Date().toISOString() })
      .eq("id", input.invitationId);

    await writeInvitationAuditLog({
      invitationId: input.invitationId,
      action: input.successAction ?? "emailed",
      actorId: input.actorId,
      metadata: {
        provider: emailResult.provider,
        ...(emailResult.provider === "resend"
          ? { message_id: emailResult.id }
          : { warning: emailResult.warning }),
      },
    });
  } else {
    await writeInvitationAuditLog({
      invitationId: input.invitationId,
      action: "email_failed",
      actorId: input.actorId,
      metadata: {
        provider: emailResult.provider,
        error: emailResult.error,
      },
    });
  }

  const emailSent = emailResult.ok && emailResult.provider === "resend";

  return {
    emailSent,
    inviteUrl: emailSent ? undefined : input.inviteUrl,
    emailWarning:
      emailResult.ok && emailResult.provider === "dev_fallback"
        ? emailResult.warning
        : !emailResult.ok
          ? emailResult.error
          : undefined,
  };
}
