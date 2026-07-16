import "server-only";

import { assertSuperAdmin } from "@/features/auth/lib/assert-super-admin";
import {
  generateInvitationToken,
  hashInvitationToken,
} from "@/features/auth/lib/invitation-token";
import { requireAppUrl } from "@/features/auth/lib/require-app-url";
import { sendInvitationEmail } from "@/features/auth/lib/send-invitation-email";
import { writeInvitationAuditLog } from "@/features/auth/invite/audit";
import { InvitationError } from "@/features/auth/invite/errors";
import {
  isInvitationExpired,
  markInvitationsExpired,
} from "@/features/auth/invite/expire-invitations";
import {
  INVITATION_TTL_HOURS,
  INVITE_ROLE_LABELS,
  inviteUserSchema,
  type InviteUserInput,
} from "@/features/auth/schemas/invite";
import { createAdminClient } from "@/lib/supabase/admin";

export type InviteUserResult = {
  invitationId: string;
  email: string;
  expiresAt: string;
  emailSent: boolean;
  /** Only returned when email was not delivered via Resend (manual share). */
  inviteUrl?: string;
  emailWarning?: string;
};

/**
 * Super Admin only. Creates a single-use invitation (72h), emails the link,
 * and writes an audit log. Does not create an Auth user until accept.
 */
export async function inviteUser(
  input: InviteUserInput,
): Promise<InviteUserResult> {
  const values = inviteUserSchema.parse(input);
  const actor = await assertSuperAdmin();
  const admin = createAdminClient();
  const email = values.email.trim().toLowerCase();
  const appUrl = requireAppUrl();

  if (await authUserExistsByEmail(admin, email)) {
    throw new InvitationError("A user with this email already exists.");
  }

  const { data: pendingInvite, error: pendingError } = await admin
    .from("invitations")
    .select("id, expires_at, status")
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingError) {
    console.error("pending invitation lookup failed", pendingError.message);
    throw new InvitationError("Failed to create invitation.");
  }

  if (pendingInvite) {
    if (!isInvitationExpired(pendingInvite.expires_at)) {
      throw new InvitationError(
        "A pending invitation already exists for this email. Revoke it before inviting again.",
      );
    }
    await markInvitationsExpired({
      ids: [pendingInvite.id],
      reason: "auto_expired_before_reinvite",
      actorId: actor.id,
    });
  }

  const token = generateInvitationToken();
  const tokenHash = hashInvitationToken(token);
  const expiresAt = new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);
  const inviteUrl = `${appUrl}/invite/accept?token=${encodeURIComponent(token)}`;

  const { data: invitation, error: insertError } = await admin
    .from("invitations")
    .insert({
      email,
      full_name: values.fullName.trim(),
      company: values.company.trim(),
      role: values.role,
      token_hash: tokenHash,
      status: "pending",
      invited_by: actor.id,
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (insertError || !invitation) {
    if (insertError?.code === "23505") {
      throw new InvitationError(
        "A pending invitation already exists for this email. Revoke it before inviting again.",
      );
    }
    console.error("invitation insert failed", insertError?.message);
    throw new InvitationError("Failed to create invitation.");
  }

  await writeInvitationAuditLog({
    invitationId: invitation.id,
    action: "created",
    actorId: actor.id,
    metadata: {
      email,
      role: values.role,
      company: values.company,
      expires_at: expiresAt.toISOString(),
    },
  });

  const emailResult = await sendInvitationEmail({
    to: email,
    fullName: values.fullName.trim(),
    company: values.company.trim(),
    roleLabel: INVITE_ROLE_LABELS[values.role].en,
    inviteUrl,
    expiresAt,
  });

  if (emailResult.ok) {
    await admin
      .from("invitations")
      .update({ last_sent_at: new Date().toISOString() })
      .eq("id", invitation.id);

    await writeInvitationAuditLog({
      invitationId: invitation.id,
      action: "emailed",
      actorId: actor.id,
      metadata: {
        provider: emailResult.provider,
        ...(emailResult.provider === "resend"
          ? { message_id: emailResult.id }
          : { warning: emailResult.warning }),
      },
    });
  } else {
    await writeInvitationAuditLog({
      invitationId: invitation.id,
      action: "email_failed",
      actorId: actor.id,
      metadata: {
        provider: emailResult.provider,
        error: emailResult.error,
      },
    });
  }

  const emailSent = emailResult.ok && emailResult.provider === "resend";

  return {
    invitationId: invitation.id,
    email,
    expiresAt: expiresAt.toISOString(),
    emailSent,
    inviteUrl: emailSent ? undefined : inviteUrl,
    emailWarning:
      emailResult.ok && emailResult.provider === "dev_fallback"
        ? emailResult.warning
        : !emailResult.ok
          ? emailResult.error
          : undefined,
  };
}

async function authUserExistsByEmail(
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
