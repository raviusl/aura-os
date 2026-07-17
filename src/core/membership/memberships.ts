import "server-only";

import { CoreError } from "@/core/errors";
import type {
  Membership,
  MembershipRole,
  MembershipStatus,
} from "@/core/types";
import { createAdminClient } from "@/lib/supabase/admin";

function mapMembership(row: Record<string, unknown>): Membership {
  return {
    id: row.id as string,
    user_id: (row.user_id as string | null | undefined) ?? null,
    workspace_id: row.workspace_id as string,
    company_id: row.company_id as string,
    role_key: row.role_key as string,
    email: row.email as string,
    full_name: row.full_name as string,
    status: row.status as MembershipStatus,
    person_id: (row.person_id as string | null | undefined) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export function isAcceptedMembershipRecord(
  membership: Membership,
): boolean {
  return membership.status === "accepted";
}

export async function createMembership(input: {
  userId?: string | null;
  workspaceId: string;
  companyId: string;
  roleKey: MembershipRole | string;
  email: string;
  fullName: string;
  status?: MembershipStatus;
  personId?: string | null;
}): Promise<Membership> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("memberships")
    .insert({
      user_id: input.userId ?? null,
      workspace_id: input.workspaceId,
      company_id: input.companyId,
      role_key: input.roleKey,
      email: input.email.trim().toLowerCase(),
      full_name: input.fullName.trim(),
      status: input.status ?? (input.userId ? "accepted" : "pending"),
      person_id: input.personId ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      throw new CoreError(
        "MEMBERSHIP_EXISTS",
        "A membership already exists for this user in the company.",
      );
    }
    console.error("createMembership failed", error?.message);
    throw new CoreError(
      "MEMBERSHIP_CREATE_FAILED",
      "Failed to create membership.",
    );
  }

  return mapMembership(data as Record<string, unknown>);
}

export async function getMembershipById(
  membershipId: string,
): Promise<Membership> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("memberships")
    .select("*")
    .eq("id", membershipId)
    .maybeSingle();

  if (error) {
    console.error("getMembershipById failed", error.message);
    throw new CoreError("MEMBERSHIP_LOAD_FAILED", "Failed to load membership.");
  }
  if (!data) {
    throw new CoreError("MEMBERSHIP_NOT_FOUND", "Membership not found.");
  }
  return mapMembership(data as Record<string, unknown>);
}

export async function getMembershipForUserInCompany(
  userId: string,
  workspaceId: string,
  companyId: string,
): Promise<Membership | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("workspace_id", workspaceId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (error) {
    console.error("getMembershipForUserInCompany failed", error.message);
    throw new CoreError("MEMBERSHIP_LOAD_FAILED", "Failed to load membership.");
  }
  return data ? mapMembership(data as Record<string, unknown>) : null;
}

export async function listMembershipsForUser(
  userId: string,
  status: MembershipStatus = "accepted",
): Promise<Membership[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("memberships")
    .select("*")
    .eq("user_id", userId)
    .eq("status", status)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("listMembershipsForUser failed", error.message);
    throw new CoreError(
      "MEMBERSHIP_LIST_FAILED",
      "Failed to list memberships.",
    );
  }

  return (data ?? []).map((row) =>
    mapMembership(row as Record<string, unknown>),
  );
}

export async function listMembershipsByWorkspace(
  workspaceId: string,
): Promise<Membership[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("memberships")
    .select("*")
    .eq("workspace_id", workspaceId)
    .neq("status", "removed")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("listMembershipsByWorkspace failed", error.message);
    throw new CoreError(
      "MEMBERSHIP_LIST_FAILED",
      "Failed to list memberships.",
    );
  }

  return (data ?? []).map((row) =>
    mapMembership(row as Record<string, unknown>),
  );
}

export async function updateMembershipStatus(
  membershipId: string,
  status: MembershipStatus,
): Promise<Membership> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("memberships")
    .update({ status })
    .eq("id", membershipId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("updateMembershipStatus failed", error?.message);
    throw new CoreError(
      "MEMBERSHIP_UPDATE_FAILED",
      "Failed to update membership.",
    );
  }

  return mapMembership(data as Record<string, unknown>);
}

export async function updateMembershipRole(
  membershipId: string,
  roleKey: MembershipRole | string,
): Promise<Membership> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("memberships")
    .update({ role_key: roleKey })
    .eq("id", membershipId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("updateMembershipRole failed", error?.message);
    throw new CoreError(
      "MEMBERSHIP_UPDATE_FAILED",
      "Failed to update membership role.",
    );
  }

  return mapMembership(data as Record<string, unknown>);
}

export async function linkMembershipUser(
  membershipId: string,
  userId: string,
): Promise<Membership> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("memberships")
    .update({
      user_id: userId,
      status: "accepted",
    })
    .eq("id", membershipId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("linkMembershipUser failed", error?.message);
    throw new CoreError(
      "MEMBERSHIP_LINK_FAILED",
      "Failed to link membership to user.",
    );
  }

  return mapMembership(data as Record<string, unknown>);
}

export async function getPermissionsForMembership(
  membership: Membership,
): Promise<Set<string>> {
  const admin = createAdminClient();
  const roleKey =
    membership.role_key === "owner" ? "founder" : membership.role_key;

  const { data, error } = await admin
    .from("role_permissions")
    .select("permission_key")
    .eq("role_key", roleKey);

  if (error) {
    console.error("getPermissionsForMembership failed", error.message);
    throw new CoreError(
      "PERMISSION_LOAD_FAILED",
      "Failed to load permissions.",
    );
  }

  return new Set((data ?? []).map((row) => row.permission_key));
}

export async function assertMembershipPermission(
  membership: Membership,
  permission: string,
): Promise<void> {
  const permissions = await getPermissionsForMembership(membership);
  if (!permissions.has(permission)) {
    throw new CoreError(
      "PERMISSION_DENIED",
      "You do not have permission to perform this action.",
    );
  }
}

export async function requireMembershipPermission(
  userId: string,
  workspaceId: string,
  companyId: string,
  permission: string,
): Promise<Membership> {
  const membership = await getMembershipForUserInCompany(
    userId,
    workspaceId,
    companyId,
  );
  if (!membership || !isAcceptedMembershipRecord(membership)) {
    throw new CoreError(
      "PERMISSION_DENIED",
      "You do not have access to this company.",
    );
  }
  await assertMembershipPermission(membership, permission);
  return membership;
}
