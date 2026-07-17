import "server-only";

import { CoreError } from "@/core/errors";
import {
  getPersonById,
  isAcceptedMembership,
  listPeopleByWorkspace,
  listRolesForPerson,
  replaceMembershipRole,
  requirePersonPermission,
  updatePersonStatus,
} from "@/core/people/people";
import {
  membershipPersonSchema,
  setMembershipRoleSchema,
  type MembershipPersonInput,
  type SetMembershipRoleInput,
} from "@/core/schemas";
import type { MembershipRole, WorkspaceMember } from "@/core/types";
import { MEMBERSHIP_ROLES } from "@/core/types";
import { createAdminClient } from "@/lib/supabase/admin";

export type { MembershipPersonInput, SetMembershipRoleInput };

function assertNotLastFounder(
  members: WorkspaceMember[],
  personId: string,
): void {
  const founders = members.filter(
    (member) =>
      member.status !== "removed" &&
      (member.roles.includes("founder") || member.roles.includes("owner")),
  );
  const target = founders.find((member) => member.id === personId);
  if (target && founders.length <= 1) {
    throw new CoreError(
      "LAST_FOUNDER",
      "A workspace must retain at least one founder.",
    );
  }
}

export async function listWorkspaceMembers(
  workspaceId: string,
): Promise<WorkspaceMember[]> {
  const people = await listPeopleByWorkspace(workspaceId);
  const members: WorkspaceMember[] = [];

  for (const person of people) {
    if (person.status === "removed") continue;
    const roles = await listRolesForPerson(person.id);
    members.push({
      ...person,
      roles: roles.map((role) => role.role_key),
    });
  }

  return members;
}

export async function setMembershipRole(
  actorUserId: string,
  input: SetMembershipRoleInput,
): Promise<WorkspaceMember> {
  const values = setMembershipRoleSchema.parse(input);
  await requirePersonPermission(
    actorUserId,
    values.workspaceId,
    "people.assign_role",
  );

  const person = await getPersonById(values.personId);
  if (person.workspace_id !== values.workspaceId) {
    throw new CoreError(
      "PERSON_WORKSPACE_MISMATCH",
      "Person does not belong to this workspace.",
    );
  }
  if (person.status === "removed") {
    throw new CoreError(
      "MEMBERSHIP_REMOVED",
      "Cannot assign a role to a removed membership.",
    );
  }

  if (values.role !== "founder") {
    const members = await listWorkspaceMembers(values.workspaceId);
    assertNotLastFounder(members, values.personId);
  }

  await replaceMembershipRole(person.id, values.role);
  const roles = await listRolesForPerson(person.id);

  return {
    ...person,
    roles: roles.map((role) => role.role_key),
  };
}

export async function suspendMembership(
  actorUserId: string,
  input: MembershipPersonInput,
): Promise<WorkspaceMember> {
  const values = membershipPersonSchema.parse(input);
  await requirePersonPermission(
    actorUserId,
    values.workspaceId,
    "people.write",
  );

  const person = await getPersonById(values.personId);
  if (person.workspace_id !== values.workspaceId) {
    throw new CoreError(
      "PERSON_WORKSPACE_MISMATCH",
      "Person does not belong to this workspace.",
    );
  }

  const members = await listWorkspaceMembers(values.workspaceId);
  assertNotLastFounder(members, values.personId);

  const updated = await updatePersonStatus(person.id, "suspended");
  const roles = await listRolesForPerson(updated.id);
  return { ...updated, roles: roles.map((role) => role.role_key) };
}

export async function restoreMembership(
  actorUserId: string,
  input: MembershipPersonInput,
): Promise<WorkspaceMember> {
  const values = membershipPersonSchema.parse(input);
  await requirePersonPermission(
    actorUserId,
    values.workspaceId,
    "people.write",
  );

  const person = await getPersonById(values.personId);
  if (person.workspace_id !== values.workspaceId) {
    throw new CoreError(
      "PERSON_WORKSPACE_MISMATCH",
      "Person does not belong to this workspace.",
    );
  }
  if (person.status !== "suspended") {
    throw new CoreError(
      "MEMBERSHIP_NOT_SUSPENDED",
      "Only suspended memberships can be restored.",
    );
  }

  const updated = await updatePersonStatus(person.id, "accepted");
  const roles = await listRolesForPerson(updated.id);
  return { ...updated, roles: roles.map((role) => role.role_key) };
}

export async function removeMembership(
  actorUserId: string,
  input: MembershipPersonInput,
): Promise<WorkspaceMember> {
  const values = membershipPersonSchema.parse(input);
  await requirePersonPermission(
    actorUserId,
    values.workspaceId,
    "people.write",
  );

  const person = await getPersonById(values.personId);
  if (person.workspace_id !== values.workspaceId) {
    throw new CoreError(
      "PERSON_WORKSPACE_MISMATCH",
      "Person does not belong to this workspace.",
    );
  }

  const members = await listWorkspaceMembers(values.workspaceId);
  assertNotLastFounder(members, values.personId);

  const updated = await updatePersonStatus(person.id, "removed");
  const roles = await listRolesForPerson(updated.id);

  // Revoke any pending invitations for this email in the workspace.
  const admin = createAdminClient();
  await admin
    .from("core_invitations")
    .update({ status: "revoked" })
    .eq("workspace_id", values.workspaceId)
    .eq("email", person.email)
    .eq("status", "pending");

  return { ...updated, roles: roles.map((role) => role.role_key) };
}

export function isMembershipRole(role: string): role is MembershipRole {
  return (MEMBERSHIP_ROLES as readonly string[]).includes(role);
}

export { isAcceptedMembership };
