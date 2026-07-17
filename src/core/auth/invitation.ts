import "server-only";

import { createCompany, getCompanyById } from "@/core/company/company";
import { CoreError } from "@/core/errors";
import {
  CORE_INVITATION_TTL_HOURS,
  generateCoreInvitationToken,
  hashCoreInvitationToken,
} from "@/core/lib/invitation-token";
import {
  createPerson,
  requirePersonPermission,
} from "@/core/people/people";
import {
  acceptCoreInvitationSchema,
  invitePersonSchema,
  type AcceptCoreInvitationInput,
  type InvitePersonInput,
} from "@/core/schemas";
import type { CoreInvitation, CoreRole } from "@/core/types";
import {
  createWorkspace,
  getWorkspaceById,
} from "@/core/workspace/workspace";
import { requireAppUrl } from "@/features/auth/lib/require-app-url";
import { sendInvitationEmail } from "@/features/auth/lib/send-invitation-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type { AcceptCoreInvitationInput, InvitePersonInput };

export type InvitePersonResult = {
  invitationId: string;
  personId: string;
  email: string;
  inviteUrl?: string;
  emailSent: boolean;
  expiresAt: string;
};

/**
 * Invitation-only onboarding into the unified People model.
 * Public sign-up is not supported.
 */
export async function invitePerson(
  actorUserId: string,
  input: InvitePersonInput,
): Promise<InvitePersonResult> {
  const values = invitePersonSchema.parse(input);
  await requirePersonPermission(
    actorUserId,
    values.workspaceId,
    "people.invite",
  );
  await getWorkspaceById(values.workspaceId);

  if (values.companyId) {
    await getCompanyById(values.companyId, values.workspaceId);
  }

  const { person } = await createPerson({
    workspaceId: values.workspaceId,
    companyId: values.companyId ?? null,
    email: values.email,
    fullName: values.fullName,
    role: values.role,
    status: "invited",
  });

  const token = generateCoreInvitationToken();
  const tokenHash = hashCoreInvitationToken(token);
  const expiresAt = new Date(
    Date.now() + CORE_INVITATION_TTL_HOURS * 60 * 60 * 1000,
  );
  const admin = createAdminClient();

  const { data: invitation, error } = await admin
    .from("core_invitations")
    .insert({
      workspace_id: values.workspaceId,
      company_id: values.companyId ?? null,
      email: values.email.trim().toLowerCase(),
      full_name: values.fullName.trim(),
      role_key: values.role,
      token_hash: tokenHash,
      status: "pending",
      invited_by_user_id: actorUserId,
      invited_person_id: person.id,
      expires_at: expiresAt.toISOString(),
    })
    .select("*")
    .single();

  if (error || !invitation) {
    if (error?.code === "23505") {
      throw new CoreError(
        "INVITATION_PENDING",
        "A pending invitation already exists for this email in the workspace.",
      );
    }
    console.error("invitePerson insert failed", error?.message);
    throw new CoreError(
      "INVITATION_CREATE_FAILED",
      "Failed to create invitation.",
    );
  }

  const appUrl = requireAppUrl();
  const inviteUrl = `${appUrl}/invite/accept?token=${encodeURIComponent(token)}&source=core`;

  const emailResult = await sendInvitationEmail({
    to: values.email.trim().toLowerCase(),
    fullName: values.fullName.trim(),
    company: "RIVA",
    roleLabel: values.role,
    inviteUrl,
    expiresAt,
  });

  return {
    invitationId: invitation.id,
    personId: person.id,
    email: values.email.trim().toLowerCase(),
    inviteUrl:
      emailResult.ok && emailResult.provider === "resend" ? undefined : inviteUrl,
    emailSent: emailResult.ok && emailResult.provider === "resend",
    expiresAt: expiresAt.toISOString(),
  };
}

export async function acceptCoreInvitation(
  input: AcceptCoreInvitationInput,
): Promise<{ signedIn: boolean; email: string; workspaceId: string }> {
  const values = acceptCoreInvitationSchema.parse(input);
  const admin = createAdminClient();
  const tokenHash = hashCoreInvitationToken(values.token);

  const { data: invitation, error } = await admin
    .from("core_invitations")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !invitation) {
    throw new CoreError(
      "INVITATION_INVALID",
      "Invitation not found or invalid.",
    );
  }

  const row = invitation as CoreInvitation;

  if (row.status === "accepted") {
    throw new CoreError(
      "INVITATION_USED",
      "This invitation has already been used.",
    );
  }
  if (row.status === "revoked") {
    throw new CoreError(
      "INVITATION_REVOKED",
      "This invitation has been revoked.",
    );
  }
  if (
    row.status === "expired" ||
    new Date(row.expires_at).getTime() <= Date.now()
  ) {
    if (row.status === "pending") {
      await admin
        .from("core_invitations")
        .update({ status: "expired" })
        .eq("id", row.id)
        .eq("status", "pending");
    }
    throw new CoreError("INVITATION_EXPIRED", "This invitation has expired.");
  }

  const claimedAt = new Date().toISOString();
  const { data: claimed, error: claimError } = await admin
    .from("core_invitations")
    .update({
      status: "accepted",
      accepted_at: claimedAt,
    })
    .eq("id", row.id)
    .eq("status", "pending")
    .gt("expires_at", claimedAt)
    .select("id")
    .maybeSingle();

  if (claimError || !claimed) {
    throw new CoreError(
      "INVITATION_USED",
      "This invitation has already been used or is no longer valid.",
    );
  }

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: row.email,
      password: values.password,
      email_confirm: true,
      user_metadata: {
        full_name: row.full_name,
        display_name: row.full_name,
      },
      app_metadata: {
        role: row.role_key,
      },
    });

  if (createError || !created.user) {
    await admin
      .from("core_invitations")
      .update({
        status: "pending",
        accepted_at: null,
        accepted_user_id: null,
      })
      .eq("id", row.id)
      .eq("status", "accepted")
      .is("accepted_user_id", null);

    const message = createError?.message?.toLowerCase() ?? "";
    if (message.includes("already") || message.includes("registered")) {
      throw new CoreError(
        "USER_EXISTS",
        "A user with this email already exists.",
      );
    }
    console.error(
      "acceptCoreInvitation createUser failed",
      createError?.message,
    );
    throw new CoreError("USER_CREATE_FAILED", "Failed to create user account.");
  }

  if (row.invited_person_id) {
    await admin
      .from("people")
      .update({
        user_id: created.user.id,
        status: "active",
      })
      .eq("id", row.invited_person_id);
  }

  await admin
    .from("core_invitations")
    .update({ accepted_user_id: created.user.id })
    .eq("id", row.id);

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: row.email,
    password: values.password,
  });

  return {
    signedIn: !signInError,
    email: row.email,
    workspaceId: row.workspace_id,
  };
}

export async function bootstrapOwner(input: {
  workspaceName: string;
  companyName: string;
  ownerEmail: string;
  ownerFullName: string;
  ownerUserId: string;
}): Promise<{ workspaceId: string; companyId: string; personId: string }> {
  const workspace = await createWorkspace({ name: input.workspaceName });
  const company = await createCompany({
    workspaceId: workspace.id,
    name: input.companyName,
  });
  const { person } = await createPerson({
    workspaceId: workspace.id,
    companyId: company.id,
    email: input.ownerEmail,
    fullName: input.ownerFullName,
    role: "owner" satisfies CoreRole,
    userId: input.ownerUserId,
    status: "active",
  });

  return {
    workspaceId: workspace.id,
    companyId: company.id,
    personId: person.id,
  };
}
