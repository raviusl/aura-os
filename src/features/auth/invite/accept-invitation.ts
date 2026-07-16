import "server-only";

import { writeInvitationAuditLog } from "@/features/auth/invite/audit";
import { InvitationError } from "@/features/auth/invite/errors";
import {
  isInvitationExpired,
  markInvitationsExpired,
} from "@/features/auth/invite/expire-invitations";
import { hashInvitationToken } from "@/features/auth/lib/invitation-token";
import {
  acceptInvitationSchema,
  type AcceptInvitationInput,
} from "@/features/auth/schemas/invite";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

export type AcceptInvitationPreview = {
  email: string;
  fullName: string;
  company: string;
  role: string;
  expiresAt: string;
};

type InvitationRow = Tables<"invitations">;

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

/**
 * Claim invitation first (single-use), then create Auth user + profile.
 * Rolls invitation back to pending if account creation fails.
 */
export async function acceptInvitation(input: AcceptInvitationInput) {
  const values = acceptInvitationSchema.parse(input);
  const invitation = await loadValidPendingInvitation(values.token);
  const admin = createAdminClient();

  const claimedAt = new Date().toISOString();
  const { data: claimed, error: claimError } = await admin
    .from("invitations")
    .update({
      status: "accepted",
      accepted_at: claimedAt,
    })
    .eq("id", invitation.id)
    .eq("status", "pending")
    .gt("expires_at", claimedAt)
    .select("id")
    .maybeSingle();

  if (claimError || !claimed) {
    throw new InvitationError(
      "This invitation has already been used or is no longer valid.",
    );
  }

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
    await releaseInvitationClaim(admin, invitation.id);
    const message = createError?.message?.toLowerCase() ?? "";
    if (message.includes("already") || message.includes("registered")) {
      throw new InvitationError("A user with this email already exists.");
    }
    console.error("invite accept createUser failed", createError?.message);
    throw new InvitationError("Failed to create user account.");
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
    await admin.auth.admin.deleteUser(created.user.id);
    await releaseInvitationClaim(admin, invitation.id);
    throw new InvitationError(
      "Failed to finalize your account. Please try again.",
    );
  }

  const { error: linkError } = await admin
    .from("invitations")
    .update({ accepted_user_id: created.user.id })
    .eq("id", invitation.id);

  if (linkError) {
    console.error("invitation user link failed", linkError.message);
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
    return { signedIn: false as const, email: invitation.email };
  }

  return { signedIn: true as const, email: invitation.email };
}

async function releaseInvitationClaim(
  admin: ReturnType<typeof createAdminClient>,
  invitationId: string,
) {
  const { error } = await admin
    .from("invitations")
    .update({
      status: "pending",
      accepted_at: null,
      accepted_user_id: null,
    })
    .eq("id", invitationId)
    .eq("status", "accepted")
    .is("accepted_user_id", null);

  if (error) {
    console.error("failed to release invitation claim", error.message);
  }
}

async function loadValidPendingInvitation(token: string): Promise<InvitationRow> {
  const admin = createAdminClient();
  const tokenHash = hashInvitationToken(token);

  const { data: invitation, error } = await admin
    .from("invitations")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    console.error("invitation load failed", error.message);
    throw new InvitationError("Invitation not found or invalid.");
  }
  if (!invitation) {
    throw new InvitationError("Invitation not found or invalid.");
  }

  if (invitation.status === "accepted") {
    throw new InvitationError("This invitation has already been used.");
  }
  if (invitation.status === "revoked") {
    throw new InvitationError("This invitation has been revoked.");
  }

  if (
    invitation.status === "expired" ||
    isInvitationExpired(invitation.expires_at)
  ) {
    if (invitation.status === "pending") {
      await markInvitationsExpired({
        ids: [invitation.id],
        reason: "checked_on_accept",
      });
    }
    throw new InvitationError("This invitation has expired.");
  }

  if (invitation.status !== "pending") {
    throw new InvitationError("This invitation is no longer valid.");
  }

  return invitation;
}
