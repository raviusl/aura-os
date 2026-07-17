import "server-only";

import { CoreError } from "@/core/errors";
import {
  getPersonByUserAndWorkspace,
  listPeopleByWorkspace,
} from "@/core/people/people";
import { getPermissionsForPerson } from "@/core/permissions/rbac";
import type { Person, WorkspaceContext } from "@/core/types";
import { listCompaniesByWorkspace } from "@/core/company/company";
import { getWorkspaceById } from "@/core/workspace/workspace";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function getSessionUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function requireSessionUserId(): Promise<string> {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new CoreError("UNAUTHENTICATED", "You must be signed in.");
  }
  return userId;
}

/**
 * Resolves the caller's active person in a workspace.
 */
export async function resolveWorkspaceContext(
  workspaceId: string,
): Promise<WorkspaceContext & { person: Person; permissions: Set<string> }> {
  const userId = await requireSessionUserId();
  const person = await getPersonByUserAndWorkspace(userId, workspaceId);

  if (!person || person.status !== "active") {
    throw new CoreError(
      "PERMISSION_DENIED",
      "You do not have access to this workspace.",
    );
  }

  const permissions = await getPermissionsForPerson(person.id);

  return {
    workspaceId,
    companyId: person.company_id,
    personId: person.id,
    userId,
    person,
    permissions,
  };
}

export async function listWorkspacesForUser(userId: string) {
  const admin = createAdminClient();
  const { data: people, error } = await admin
    .from("people")
    .select("workspace_id, status")
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("listWorkspacesForUser failed", error.message);
    throw new CoreError(
      "WORKSPACE_LIST_FAILED",
      "Failed to list workspaces.",
    );
  }

  const workspaceIds = [...new Set((people ?? []).map((row) => row.workspace_id))];
  if (workspaceIds.length === 0) {
    return [];
  }

  const { data: workspaces, error: workspaceError } = await admin
    .from("workspaces")
    .select("*")
    .in("id", workspaceIds)
    .order("name", { ascending: true });

  if (workspaceError) {
    console.error("listWorkspacesForUser workspaces failed", workspaceError.message);
    throw new CoreError(
      "WORKSPACE_LIST_FAILED",
      "Failed to list workspaces.",
    );
  }

  return workspaces ?? [];
}

export async function getWorkspaceFoundationSnapshot(workspaceId: string) {
  await getWorkspaceById(workspaceId);
  const [companies, people] = await Promise.all([
    listCompaniesByWorkspace(workspaceId),
    listPeopleByWorkspace(workspaceId),
  ]);

  return {
    workspaceId,
    companyCount: companies.length,
    peopleCount: people.length,
  };
}
