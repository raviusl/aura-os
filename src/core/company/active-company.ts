import "server-only";

import { cookies } from "next/headers";

import { CoreError } from "@/core/errors";
import { getCompanyById, listCompaniesByWorkspace } from "@/core/company/company";
import {
  getMembershipForUserInCompany,
  listMembershipsForUser,
} from "@/core/membership/memberships";
import type { Company, Membership, Workspace } from "@/core/types";
import {
  getActiveWorkspaceIdCookie,
  listWorkspacesForUser,
} from "@/core/workspace/active-workspace";

export const ACTIVE_COMPANY_COOKIE = "riva_active_company_id";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export async function getActiveCompanyIdCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACTIVE_COMPANY_COOKIE)?.value ?? null;
}

/** Cookie write — Server Actions / Route Handlers only. */
export async function setActiveCompanyIdCookie(
  companyId: string,
): Promise<void> {
  const jar = await cookies();
  jar.set(ACTIVE_COMPANY_COOKIE, companyId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearActiveCompanyIdCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACTIVE_COMPANY_COOKIE);
}

export async function listCompaniesForUserInWorkspace(
  userId: string,
  workspaceId: string,
): Promise<Company[]> {
  const memberships = await listMembershipsForUser(userId);
  const companyIds = [
    ...new Set(
      memberships
        .filter((row) => row.workspace_id === workspaceId)
        .map((row) => row.company_id),
    ),
  ];
  if (companyIds.length === 0) {
    return listCompaniesByWorkspace(workspaceId);
  }

  const companies = await Promise.all(
    companyIds.map((id) => getCompanyById(id, workspaceId)),
  );
  return companies.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Resolves active company within the active workspace (read-only for RSC).
 */
export async function resolveActiveCompany(
  userId: string,
  workspace: Workspace,
): Promise<{ company: Company; membership: Membership } | null> {
  const memberships = await listMembershipsForUser(userId);
  const inWorkspace = memberships.filter(
    (row) => row.workspace_id === workspace.id,
  );
  if (inWorkspace.length === 0) {
    return null;
  }

  const cookieCompanyId = await getActiveCompanyIdCookie();
  const fromCookie = cookieCompanyId
    ? inWorkspace.find((row) => row.company_id === cookieCompanyId)
    : undefined;

  const selected = fromCookie ?? inWorkspace[0]!;
  const company = await getCompanyById(selected.company_id, workspace.id);

  return { company, membership: selected };
}

export async function switchActiveCompany(
  userId: string,
  workspaceId: string,
  companyId: string,
): Promise<{ company: Company; membership: Membership }> {
  const membership = await getMembershipForUserInCompany(
    userId,
    workspaceId,
    companyId,
  );
  if (!membership || membership.status !== "accepted") {
    throw new CoreError(
      "PERMISSION_DENIED",
      "You do not have access to this company.",
    );
  }

  const company = await getCompanyById(companyId, workspaceId);
  await setActiveCompanyIdCookie(company.id);
  return { company, membership };
}

export async function ensureWorkspaceCompanyContext(userId: string): Promise<{
  workspace: Workspace;
  company: Company;
  membership: Membership;
} | null> {
  const workspaces = await listWorkspacesForUser(userId);
  if (workspaces.length === 0) {
    return null;
  }

  const workspaceCookie = await getActiveWorkspaceIdCookie();
  const workspace =
    workspaces.find((row) => row.id === workspaceCookie) ?? workspaces[0]!;

  const resolved = await resolveActiveCompany(userId, workspace);
  if (!resolved) {
    return null;
  }

  return {
    workspace,
    company: resolved.company,
    membership: resolved.membership,
  };
}
