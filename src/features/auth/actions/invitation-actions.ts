"use server";

import { revalidatePath } from "next/cache";

import { acceptInvitation } from "@/features/auth/invite/accept-invitation";
import { toInvitationActionError } from "@/features/auth/invite/errors";
import { inviteUser } from "@/features/auth/invite/invite-user";
import { revokeInvitation } from "@/features/auth/invite/list-invitations";
import type {
  AcceptInvitationInput,
  InviteUserInput,
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
    expiresAt: string;
    emailSent: boolean;
    inviteUrl?: string;
    emailWarning?: string;
  }>
> {
  try {
    const result = await inviteUser(input);
    revalidatePath("/dashboard/settings/users");
    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      error: toInvitationActionError(error, "Failed to invite user"),
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
      error: toInvitationActionError(error, "Failed to revoke invitation"),
    };
  }
}

export async function acceptInvitationAction(
  input: AcceptInvitationInput,
): Promise<ActionResult<{ signedIn: boolean; email: string }>> {
  try {
    const result = await acceptInvitation(input);
    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      error: toInvitationActionError(error, "Failed to accept invitation"),
    };
  }
}
