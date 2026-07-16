import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { writeInvitationAuditLog } from "@/features/auth/invite/audit";
import { hashInvitationToken } from "@/features/auth/lib/invitation-token";
import {
  acceptInvitationSchema,
  type AcceptInvitationInput,
} from "@/features/auth/schemas/invite";

export type AcceptInvitationPreview = {
  email: string;
  fullName: string;
  company: string;
  role: string;
  expiresAt: string;
};

export async function getInvitationPreview(
  token: string,
): Promise<AcceptInvitationPreview> {
  const invitation = await loadValidPendingInvitation(token);
  return {
    email: invitation.email,
    fullName: invitation.full_name,
    company: invitation.company,
    role: invitation.role,
    expiresAt: invitation.expires_at,
  };
}

export async function acceptInvitation(input: AcceptInvitationInput) {
  const values = acceptInvitationSchema.parse(input);
  const invitation = await loadValidPendingInvitation(values.token);
  const admin = createAdminClient();

  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: invitation.email,
      password: values.password,
      email_confirm: true,
      user_metadata: {
        full_name: invitation.full_name,
        display_name: invitation.full_name,
        company: invitation.company,
        role: invitation.role,
      },
      app_metadata: {
        role: invitation.role === "admin" ? "admin" : "member",
        invite_role: invitation.role,
      },
    });

  if (createError || !created.user) {
    throw new Error(createError?.message ?? "Failed to create user account.");
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: invitation.full_name,
      display_name: invitation.full_name,
      company: invitation.company,
      role: invitation.role,
    })
    .eq("id", created.user.id);

  if (profileError) {
    console.error("profile update after invite accept failed", profileError.message);
  }

  const { data: claimed, error: claimError } = await admin
    .from("invitations")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      accepted_user_id: created.user.id,
    })
    .eq("id", invitation.id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (claimError || !claimed) {
    // Roll back auth user if invitation was raced/reused
    await admin.auth.admin.deleteUser(created.user.id);
    throw new Error("This invitation has already been used or is no longer valid.");
  }

  await writeInvitationAuditLog({
    invitationId: invitation.id,
    action: "accepted",
    actorId: created.user.id,
    metadata: { email: invitation.email, user_id: created.user.id },
  });

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: invitation.email,
    password: values.password,
  });

  if (signInError) {
    // Account exists; user can sign in manually.
    return { signedIn: false as const, email: invitation.email };
  }

  return { signedIn: true as const, email: invitation.email };
}

async function loadValidPendingInvitation(token: string) {
  const admin = createAdminClient();
  const tokenHash = hashInvitationToken(token);

  const { data: invitation, error } = await admin
    .from("invitations")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!invitation) {
    throw new Error("Invitation not found or invalid.");
  }

  if (invitation.status === "accepted") {
    throw new Error("This invitation has already been used.");
  }
  if (invitation.status === "revoked") {
    throw new Error("This invitation has been revoked.");
  }

  if (
    invitation.status === "expired" ||
    new Date(invitation.expires_at).getTime() <= Date.now()
  ) {
    if (invitation.status === "pending") {
      await admin
        .from("invitations")
        .update({ status: "expired" })
        .eq("id", invitation.id)
        .eq("status", "pending");
      await writeInvitationAuditLog({
        invitationId: invitation.id,
        action: "expired",
        metadata: { reason: "checked_on_accept" },
      });
    }
    throw new Error("This invitation has expired.");
  }

  if (invitation.status !== "pending") {
    throw new Error("This invitation is no longer valid.");
  }

  return invitation;
}
