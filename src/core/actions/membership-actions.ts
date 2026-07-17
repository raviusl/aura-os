"use server";

import { revalidatePath } from "next/cache";

import {
  acceptCoreInvitation,
  expirePendingInvitations,
  invitePerson,
  listWorkspaceInvitations,
  rejectCoreInvitation,
  revokeCoreInvitation,
} from "@/core/auth/invitation";
import { requireSessionUserId } from "@/core/auth/session";
import { toCoreUserMessage } from "@/core/errors";
import {
  listWorkspaceMembers,
  removeMembership,
  restoreMembership,
  setMembershipRole,
  suspendMembership,
} from "@/core/membership/membership";
import { requirePersonPermission } from "@/core/people/people";
import type {
  AcceptCoreInvitationInput,
  InvitePersonInput,
  MembershipPersonInput,
  RejectCoreInvitationInput,
  SetMembershipRoleInput,
} from "@/core/schemas";

export type MembershipActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function revalidateMembershipPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/settings/members");
  revalidatePath("/dashboard/workspaces");
}

export async function inviteMemberAction(
  input: InvitePersonInput,
): Promise<
  MembershipActionResult<{
    invitationId: string;
    personId: string;
    email: string;
    inviteUrl?: string;
    emailSent: boolean;
    expiresAt: string;
  }>
> {
  try {
    const userId = await requireSessionUserId();
    const result = await invitePerson(userId, input);
    revalidateMembershipPaths();
    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to invite member"),
    };
  }
}

export async function acceptMembershipInvitationAction(
  input: AcceptCoreInvitationInput,
): Promise<
  MembershipActionResult<{ signedIn: boolean; email: string; workspaceId: string }>
> {
  try {
    const result = await acceptCoreInvitation(input);
    revalidateMembershipPaths();
    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to accept invitation"),
    };
  }
}

export async function rejectMembershipInvitationAction(
  input: RejectCoreInvitationInput,
): Promise<MembershipActionResult<{ email: string; workspaceId: string }>> {
  try {
    const result = await rejectCoreInvitation(input);
    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to reject invitation"),
    };
  }
}

export async function revokeMembershipInvitationAction(input: {
  workspaceId: string;
  invitationId: string;
}): Promise<MembershipActionResult> {
  try {
    const userId = await requireSessionUserId();
    await revokeCoreInvitation(
      userId,
      input.invitationId,
      input.workspaceId,
    );
    revalidateMembershipPaths();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to revoke invitation"),
    };
  }
}

export async function expireWorkspaceInvitationsAction(input: {
  workspaceId: string;
}): Promise<MembershipActionResult<{ expiredCount: number }>> {
  try {
    const userId = await requireSessionUserId();
    await requirePersonPermission(userId, input.workspaceId, "people.invite");
    const expiredCount = await expirePendingInvitations(input.workspaceId);
    revalidateMembershipPaths();
    return { ok: true, data: { expiredCount } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to expire invitations"),
    };
  }
}

export async function listMembersAction(input: {
  workspaceId: string;
}): Promise<
  MembershipActionResult<{
    members: Awaited<ReturnType<typeof listWorkspaceMembers>>;
    invitations: Awaited<ReturnType<typeof listWorkspaceInvitations>>;
  }>
> {
  try {
    const userId = await requireSessionUserId();
    await requirePersonPermission(userId, input.workspaceId, "people.read");
    const [members, invitations] = await Promise.all([
      listWorkspaceMembers(input.workspaceId),
      listWorkspaceInvitations(input.workspaceId),
    ]);
    return { ok: true, data: { members, invitations } };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to load members"),
    };
  }
}

export async function setMembershipRoleAction(
  input: SetMembershipRoleInput,
): Promise<MembershipActionResult> {
  try {
    const userId = await requireSessionUserId();
    await setMembershipRole(userId, input);
    revalidateMembershipPaths();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to update role"),
    };
  }
}

export async function suspendMembershipAction(
  input: MembershipPersonInput,
): Promise<MembershipActionResult> {
  try {
    const userId = await requireSessionUserId();
    await suspendMembership(userId, input);
    revalidateMembershipPaths();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to suspend membership"),
    };
  }
}

export async function restoreMembershipAction(
  input: MembershipPersonInput,
): Promise<MembershipActionResult> {
  try {
    const userId = await requireSessionUserId();
    await restoreMembership(userId, input);
    revalidateMembershipPaths();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to restore membership"),
    };
  }
}

export async function removeMembershipAction(
  input: MembershipPersonInput,
): Promise<MembershipActionResult> {
  try {
    const userId = await requireSessionUserId();
    await removeMembership(userId, input);
    revalidateMembershipPaths();
    return { ok: true, data: undefined };
  } catch (error) {
    return {
      ok: false,
      error: toCoreUserMessage(error, "Failed to remove membership"),
    };
  }
}
