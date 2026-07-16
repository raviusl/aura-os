"use server";

import { revalidatePath } from "next/cache";

import { acceptInvitation } from "@/features/auth/invite/accept-invitation";
import { inviteUser } from "@/features/auth/invite/invite-user";
import { revokeInvitation } from "@/features/auth/invite/list-invitations";
import {
  acceptInvitationSchema,
  inviteUserSchema,
  type AcceptInvitationInput,
  type InviteUserInput,
} from "@/features/auth/schemas/invite";

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function createInvitationAction(
  input: InviteUserInput,
): Promise<
  ActionResult<{
    invitationId: string;
    email: string;
    inviteUrl: string;
    expiresAt: string;
    emailSent: boolean;
    emailWarning?: string;
  }>
> {
  try {
    const values = inviteUserSchema.parse(input);
    const result = await inviteUser(values);
    revalidatePath("/dashboard/settings/users");
    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to invite user",
    };
  }
}

export async function revokeInvitationAction(
  invitationId: string,
): Promise<ActionResult> {
  try {
    await revokeInvitation(invitationId);
    revalidatePath("/dashboard/settings/users");
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to revoke invitation",
    };
  }
}

export async function acceptInvitationAction(
  input: AcceptInvitationInput,
): Promise<ActionResult<{ signedIn: boolean; email: string }>> {
  try {
    const values = acceptInvitationSchema.parse(input);
    const result = await acceptInvitation(values);
    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to accept invitation",
    };
  }
}
