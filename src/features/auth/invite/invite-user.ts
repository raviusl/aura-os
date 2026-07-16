import "server-only";

import { siteConfig } from "@/config/site";
import { assertSuperAdmin } from "@/features/auth/lib/assert-super-admin";
import {
  generateInvitationToken,
  hashInvitationToken,
} from "@/features/auth/lib/invitation-token";
import { sendInvitationEmail } from "@/features/auth/lib/send-invitation-email";
import { writeInvitationAuditLog } from "@/features/auth/invite/audit";
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
  inviteUrl: string;
  expiresAt: string;
  emailSent: boolean;
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

  if (await authUserExistsByEmail(admin, email)) {
    throw new Error("A user with this email already exists.");
  }

  const { data: pendingInvite, error: pendingError } = await admin
    .from("invitations")
    .select("id, expires_at, status")
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingError) {
    throw new Error(pendingError.message);
  }

  if (pendingInvite) {
    if (new Date(pendingInvite.expires_at).getTime() > Date.now()) {
      throw new Error(
        "A pending invitation already exists for this email. Revoke it before inviting again.",
      );
    }
    await admin
      .from("invitations")
      .update({ status: "expired" })
      .eq("id", pendingInvite.id);
    await writeInvitationAuditLog({
      invitationId: pendingInvite.id,
      action: "expired",
      actorId: actor.id,
      metadata: { reason: "auto_expired_before_reinvite" },
    });
  }

  const token = generateInvitationToken();
  const tokenHash = hashInvitationToken(token);
  const expiresAt = new Date(Date.now() + INVITATION_TTL_HOURS * 60 * 60 * 1000);
  const appUrl = siteConfig.url.replace(/\/$/, "");
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
      last_sent_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError || !invitation) {
    throw new Error(insertError?.message ?? "Failed to create invitation.");
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

  if (emailResult.ok && emailResult.provider === "resend") {
    await writeInvitationAuditLog({
      invitationId: invitation.id,
      action: "emailed",
      actorId: actor.id,
      metadata: { provider: "resend", message_id: emailResult.id },
    });
  } else if (emailResult.ok && emailResult.provider === "dev_fallback") {
    await writeInvitationAuditLog({
      invitationId: invitation.id,
      action: "emailed",
      actorId: actor.id,
      metadata: {
        provider: "dev_fallback",
        warning: emailResult.warning,
        invite_url: inviteUrl,
      },
    });
  } else if (!emailResult.ok) {
    await writeInvitationAuditLog({
      invitationId: invitation.id,
      action: "email_failed",
      actorId: actor.id,
      metadata: {
        provider: emailResult.provider,
        error: emailResult.error,
        invite_url: inviteUrl,
      },
    });
  }

  return {
    invitationId: invitation.id,
    email,
    inviteUrl,
    expiresAt: expiresAt.toISOString(),
    emailSent: emailResult.ok && emailResult.provider === "resend",
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
  const perPage = 200;
  for (let page = 1; page <= 25; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(error.message);
    }
    if (data.users.some((user) => user.email?.toLowerCase() === email)) {
      return true;
    }
    if (data.users.length < perPage) {
      return false;
    }
  }
  return false;
}
