import "server-only";

import { cookies } from "next/headers";

import { CoreError } from "@/core/errors";
import { clearActiveCompanyIdCookie } from "@/core/company/active-company";
import { listMembershipsForUser } from "@/core/membership/memberships";
import { getPersonByUserAndWorkspace } from "@/core/people/people";
import type { Workspace } from "@/core/types";
import { getWorkspaceById } from "@/core/workspace/workspace";
import { createAdminClient } from "@/lib/supabase/admin";

export const ACTIVE_WORKSPACE_COOKIE = "riva_active_workspace_id";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function mapWorkspace(row: {
  id: string;
  name: string;
  slug: string;
  status: string;
  timezone: string;
  locale: string;
  currency: string;
  country?: string | null;
  logo_url?: string | null;
  custom_domain?: string | null;
  owner_id?: string | null;
  created_at: string;
  updated_at: string;
}): Workspace {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status as Workspace["status"],
    timezone: row.timezone,
    locale: row.locale,
    currency: row.currency,
    country: row.country ?? null,
    logo_url: row.logo_url ?? null,
    custom_domain: row.custom_domain ?? null,
    owner_id: row.owner_id ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function listWorkspacesForUser(
  userId: string,
): Promise<Workspace[]> {
  const memberships = await listMembershipsForUser(userId);
  const workspaceIds = [
    ...new Set(memberships.map((row) => row.workspace_id)),
  ];

  if (workspaceIds.length === 0) {
    const admin = createAdminClient();
    const { data: people } = await admin
      .from("people")
      .select("workspace_id")
      .eq("user_id", userId)
      .eq("status", "accepted");

    for (const row of people ?? []) {
      workspaceIds.push(row.workspace_id);
    }
  }

  if (workspaceIds.length === 0) {
    return [];
  }

  const admin = createAdminClient();
  const { data: workspaces, error: workspaceError } = await admin
    .from("workspaces")
    .select("*")
    .in("id", [...new Set(workspaceIds)])
    .order("name", { ascending: true });

  if (workspaceError) {
    console.error(
      "listWorkspacesForUser workspaces failed",
      workspaceError.message,
    );
    throw new CoreError(
      "WORKSPACE_LIST_FAILED",
      "Failed to list workspaces.",
    );
  }

  return (workspaces ?? []).map((row) => mapWorkspace(row));
}

export async function getActiveWorkspaceIdCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACTIVE_WORKSPACE_COOKIE)?.value ?? null;
}

export async function setActiveWorkspaceIdCookie(
  workspaceId: string,
): Promise<void> {
  const jar = await cookies();
  jar.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearActiveWorkspaceIdCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACTIVE_WORKSPACE_COOKIE);
}

export async function resolveActiveWorkspace(
  userId: string,
): Promise<Workspace | null> {
  const memberships = await listWorkspacesForUser(userId);
  if (memberships.length === 0) {
    return null;
  }

  const cookieId = await getActiveWorkspaceIdCookie();
  const fromCookie = cookieId
    ? memberships.find((workspace) => workspace.id === cookieId)
    : undefined;

  return fromCookie ?? memberships[0]!;
}

export async function switchActiveWorkspace(
  userId: string,
  workspaceId: string,
): Promise<Workspace> {
  const memberships = await listMembershipsForUser(userId);
  const hasAccess = memberships.some(
    (row) => row.workspace_id === workspaceId,
  );

  if (!hasAccess) {
    const person = await getPersonByUserAndWorkspace(userId, workspaceId);
    if (!person || person.status !== "accepted") {
      throw new CoreError(
        "PERMISSION_DENIED",
        "You do not have access to this workspace.",
      );
    }
  }

  const workspace = await getWorkspaceById(workspaceId);
  await setActiveWorkspaceIdCookie(workspace.id);
  await clearActiveCompanyIdCookie();
  return workspace;
}
