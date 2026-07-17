import "server-only";

import {
  getSessionUserId,
  requireSessionUserId,
  requireSessionContext,
  resolveSessionContext,
} from "@/core/auth/context";
import { CoreError } from "@/core/errors";
import { getPersonByUserAndWorkspace } from "@/core/people/people";
import { getPermissionsForPerson } from "@/core/permissions/rbac";
import type { Person, WorkspaceContext } from "@/core/types";
import { listCompaniesByWorkspace } from "@/core/company/company";
import { listWorkspacesForUser, resolveActiveWorkspace } from "@/core/workspace/active-workspace";
import { getWorkspaceById } from "@/core/workspace/workspace";

export {
  getSessionUserId,
  requireSessionUserId,
  resolveSessionContext,
  requireSessionContext,
};

/**
 * Legacy workspace context (person + permissions). Prefer resolveSessionContext.
 */
export async function resolveWorkspaceContext(
  workspaceId: string,
): Promise<WorkspaceContext & { person: Person; permissions: Set<string> }> {
  const userId = await requireSessionUserId();
  const person = await getPersonByUserAndWorkspace(userId, workspaceId);

  if (!person || person.status !== "accepted") {
    throw new CoreError(
      "PERMISSION_DENIED",
      "You do not have access to this workspace.",
    );
  }

  const permissions = await getPermissionsForPerson(person.id);

  return {
    workspaceId,
    companyId: person.company_id ?? "",
    membershipId: person.id,
    personId: person.id,
    userId,
    roleKey: "member",
    person,
    permissions,
  };
}

export async function getWorkspaceFoundationSnapshot(workspaceId: string) {
  await getWorkspaceById(workspaceId);
  const [companies, people] = await Promise.all([
    listCompaniesByWorkspace(workspaceId),
    import("@/core/people/people").then((m) =>
      m.listPeopleByWorkspace(workspaceId),
    ),
  ]);

  return {
    workspaceId,
    companyCount: companies.length,
    peopleCount: people.length,
  };
}

export { listWorkspacesForUser, resolveActiveWorkspace };
