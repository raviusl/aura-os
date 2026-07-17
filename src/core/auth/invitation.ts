import "server-only";

import { authUserExistsByEmail } from "@/core/auth/auth-user-exists";
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
  updatePersonStatus,
} from "@/core/people/people";
import { listCompaniesByWorkspace } from "@/core/company/company";
import {
  createMembership,
  linkMembershipUser,
} from "@/core/membership/memberships";
import { setActiveCompanyIdCookie } from "@/core/company/active-company";
import {
  acceptCoreInvitationSchema,
  invitePersonSchema,
  rejectCoreInvitationSchema,
  type AcceptCoreInvitationInput,
  type InvitePersonInput,
  type RejectCoreInvitationInput,
} from "@/core/schemas";
import type { CoreInvitation, CoreRole, MembershipStatus } from "@/core/types";
import { setActiveWorkspaceIdCookie } from "@/core/workspace/active-workspace";
import {
  createWorkspace,
  getWorkspaceById,
} from "@/core/workspace/workspace";
import { requireAppUrl } from "@/features/auth/lib/require-app-url";
import { sendInvitationEmail } from "@/features/auth/lib/send-invitation-email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type {
  AcceptCoreInvitationInput,
  InvitePersonInput,
  RejectCoreInvitationInput,
};

export type InvitePersonResult = {
  invitationId: string;
  personId: string;
  email: string;
  inviteUrl?: string;
  emailSent: boolean;
  expiresAt: string;
};

async function loadInvitationByToken(token: string): Promise<CoreInvitation> {
  const admin = createAdminClient();
  const tokenHash = hashCoreInvitationToken(token);
  const { data, error } = await admin
    .from("core_invitations")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) {
    throw new CoreError(
      "INVITATION_INVALID",
      "Invitation not found or invalid.",
    );
  }

  return data as CoreInvitation;
}

async function markExpiredIfNeeded(row: CoreInvitation): Promise<boolean> {
  if (
    row.status === "expired" ||
    (row.status === "pending" &&
      new Date(row.expires_at).getTime() <= Date.now())
  ) {
    if (row.status === "pending") {
      const admin = createAdminClient();
      await admin
        .from("core_invitations")
        .update({ status: "expired" })
        .eq("id", row.id)
        .eq("status", "pending");
      if (row.invited_person_id) {
        await updatePersonStatus(row.invited_person_id, "removed");
      }
    }
    return true;
  }
  return false;
}

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

  let companyId = values.companyId ?? null;
  if (!companyId) {
    const companies = await listCompaniesByWorkspace(values.workspaceId);
    companyId = companies[0]?.id ?? null;
  }
  if (!companyId) {
    throw new CoreError(
      "COMPANY_REQUIRED",
      "A company is required before inviting members.",
    );
  }

  const { person } = await createPerson({
    workspaceId: values.workspaceId,
    companyId,
    email: values.email,
    fullName: values.fullName,
    role: values.role,
    status: "pending" satisfies MembershipStatus,
  });

  await createMembership({
    workspaceId: values.workspaceId,
    companyId,
    roleKey: values.role,
    email: values.email,
    fullName: values.fullName,
    status: "pending",
    personId: person.id,
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

/**
 * Accept invitation: creates Auth user OR links an existing Auth identity
 * to a new workspace membership (multi-workspace).
 */
export async function acceptCoreInvitation(
  input: AcceptCoreInvitationInput,
): Promise<{ signedIn: boolean; email: string; workspaceId: string }> {
  const values = acceptCoreInvitationSchema.parse(input);
  const admin = createAdminClient();
  const row = await loadInvitationByToken(values.token);

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
  if (row.status === "rejected") {
    throw new CoreError(
      "INVITATION_REJECTED",
      "This invitation was rejected.",
    );
  }
  if (await markExpiredIfNeeded(row)) {
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

  const existing = await authUserExistsByEmail(row.email);
  let userId: string | null = null;

  if (existing) {
    const supabase = await createClient();
    const { data: signedIn, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: row.email,
        password: values.password,
      });

    if (signInError || !signedIn.user) {
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

      throw new CoreError(
        "INVALID_CREDENTIALS",
        "Incorrect password for the existing account.",
      );
    }

    userId = signedIn.user.id;
  } else {
    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email: row.email,
        password: values.password,
        email_confirm: true,
        user_metadata: {
          full_name: row.full_name,
          display_name: row.full_name,
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
          "A user with this email already exists. Use your existing password to join.",
        );
      }
      console.error(
        "acceptCoreInvitation createUser failed",
        createError?.message,
      );
      throw new CoreError(
        "USER_CREATE_FAILED",
        "Failed to create user account.",
      );
    }

    userId = created.user.id;

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: row.email,
      password: values.password,
    });

    if (signInError) {
      console.error(
        "acceptCoreInvitation signIn failed",
        signInError.message,
      );
    }
  }

  if (!userId) {
    throw new CoreError("USER_CREATE_FAILED", "Failed to resolve user account.");
  }

  if (row.invited_person_id) {
    const { error: linkError } = await admin
      .from("people")
      .update({
        user_id: userId,
        status: "accepted" satisfies MembershipStatus,
      })
      .eq("id", row.invited_person_id);

    if (linkError) {
      console.error("acceptCoreInvitation link person failed", linkError.message);
      throw new CoreError(
        "MEMBERSHIP_LINK_FAILED",
        "Failed to link membership to your account.",
      );
    }

    const { data: membershipRow } = await admin
      .from("memberships")
      .select("id")
      .eq("person_id", row.invited_person_id)
      .maybeSingle();

    if (membershipRow?.id) {
      await linkMembershipUser(membershipRow.id, userId);
    } else if (row.company_id) {
      await createMembership({
        userId,
        workspaceId: row.workspace_id,
        companyId: row.company_id,
        roleKey: row.role_key,
        email: row.email,
        fullName: row.full_name,
        status: "accepted",
        personId: row.invited_person_id,
      });
    }
  }

  await admin
    .from("core_invitations")
    .update({ accepted_user_id: userId })
    .eq("id", row.id);

  await setActiveWorkspaceIdCookie(row.workspace_id);
  const companies = await listCompaniesByWorkspace(row.workspace_id);
  const companyId = row.company_id ?? companies[0]?.id;
  if (companyId) {
    await setActiveCompanyIdCookie(companyId);
  }

  return {
    signedIn: true,
    email: row.email,
    workspaceId: row.workspace_id,
  };
}

export async function rejectCoreInvitation(
  input: RejectCoreInvitationInput,
): Promise<{ email: string; workspaceId: string }> {
  const values = rejectCoreInvitationSchema.parse(input);
  const admin = createAdminClient();
  const row = await loadInvitationByToken(values.token);

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
  if (row.status === "rejected") {
    return { email: row.email, workspaceId: row.workspace_id };
  }
  if (await markExpiredIfNeeded(row)) {
    throw new CoreError("INVITATION_EXPIRED", "This invitation has expired.");
  }

  const rejectedAt = new Date().toISOString();
  const { data, error } = await admin
    .from("core_invitations")
    .update({
      status: "rejected",
      rejected_at: rejectedAt,
    })
    .eq("id", row.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw new CoreError(
      "INVITATION_REJECT_FAILED",
      "Failed to reject invitation.",
    );
  }

  if (row.invited_person_id) {
    await updatePersonStatus(row.invited_person_id, "removed");
  }

  return { email: row.email, workspaceId: row.workspace_id };
}

export async function revokeCoreInvitation(
  actorUserId: string,
  invitationId: string,
  workspaceId: string,
): Promise<void> {
  await requirePersonPermission(actorUserId, workspaceId, "people.invite");
  const admin = createAdminClient();

  const { data: invitation, error } = await admin
    .from("core_invitations")
    .select("*")
    .eq("id", invitationId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error || !invitation) {
    throw new CoreError("INVITATION_NOT_FOUND", "Invitation not found.");
  }

  const row = invitation as CoreInvitation;
  if (row.status !== "pending") {
    throw new CoreError(
      "INVITATION_NOT_PENDING",
      "Only pending invitations can be revoked.",
    );
  }

  const { error: updateError } = await admin
    .from("core_invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId)
    .eq("status", "pending");

  if (updateError) {
    throw new CoreError(
      "INVITATION_REVOKE_FAILED",
      "Failed to revoke invitation.",
    );
  }

  if (row.invited_person_id) {
    await updatePersonStatus(row.invited_person_id, "removed");
  }
}

/** Expire pending invitations past expires_at (and remove pending membership). */
export async function expirePendingInvitations(
  workspaceId?: string,
): Promise<number> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  let query = admin
    .from("core_invitations")
    .select("id, invited_person_id")
    .eq("status", "pending")
    .lte("expires_at", now);

  if (workspaceId) {
    query = query.eq("workspace_id", workspaceId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("expirePendingInvitations list failed", error.message);
    throw new CoreError(
      "INVITATION_EXPIRE_FAILED",
      "Failed to expire invitations.",
    );
  }

  const rows = data ?? [];
  if (rows.length === 0) return 0;

  const ids = rows.map((row) => row.id);
  const { error: updateError } = await admin
    .from("core_invitations")
    .update({ status: "expired" })
    .in("id", ids)
    .eq("status", "pending");

  if (updateError) {
    console.error("expirePendingInvitations update failed", updateError.message);
    throw new CoreError(
      "INVITATION_EXPIRE_FAILED",
      "Failed to expire invitations.",
    );
  }

  for (const row of rows) {
    if (row.invited_person_id) {
      await updatePersonStatus(row.invited_person_id, "removed");
    }
  }

  return rows.length;
}

export async function listWorkspaceInvitations(workspaceId: string) {
  await expirePendingInvitations(workspaceId);
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("core_invitations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listWorkspaceInvitations failed", error.message);
    throw new CoreError(
      "INVITATION_LIST_FAILED",
      "Failed to list invitations.",
    );
  }

  return (data ?? []) as CoreInvitation[];
}

export async function bootstrapOwner(input: {
  workspaceName: string;
  companyName: string;
  ownerEmail: string;
  ownerFullName: string;
  ownerUserId: string;
}): Promise<{ workspaceId: string; companyId: string; personId: string }> {
  const workspace = await createWorkspace({
    name: input.workspaceName,
    ownerId: input.ownerUserId,
  });
  const company = await createCompany({
    workspaceId: workspace.id,
    name: input.companyName,
    type: "agency",
  });
  const { person } = await createPerson({
    workspaceId: workspace.id,
    companyId: company.id,
    email: input.ownerEmail,
    fullName: input.ownerFullName,
    role: "founder" satisfies CoreRole,
    userId: input.ownerUserId,
    status: "accepted",
  });

  await createMembership({
    userId: input.ownerUserId,
    workspaceId: workspace.id,
    companyId: company.id,
    roleKey: "founder",
    email: input.ownerEmail,
    fullName: input.ownerFullName,
    status: "accepted",
    personId: person.id,
  });

  return {
    workspaceId: workspace.id,
    companyId: company.id,
    personId: person.id,
  };
}
