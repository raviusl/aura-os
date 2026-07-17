import "server-only";

import { CoreError } from "@/core/errors";
import type { CorePermission, CoreRole } from "@/core/types";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Resolves effective permissions for a person via their assigned roles.
 * Extensible: new roles/permissions are data, not code forks.
 */
export async function getPermissionsForPerson(
  personId: string,
): Promise<Set<string>> {
  const admin = createAdminClient();

  const { data: roleRows, error: roleError } = await admin
    .from("person_roles")
    .select("role_key")
    .eq("person_id", personId);

  if (roleError) {
    console.error("getPermissionsForPerson roles failed", roleError.message);
    throw new CoreError(
      "PERMISSION_LOAD_FAILED",
      "Failed to load person roles.",
    );
  }

  const roleKeys = (roleRows ?? []).map((row) => row.role_key);
  if (roleKeys.length === 0) {
    return new Set();
  }

  const { data: permissionRows, error: permissionError } = await admin
    .from("role_permissions")
    .select("permission_key")
    .in("role_key", roleKeys);

  if (permissionError) {
    console.error(
      "getPermissionsForPerson permissions failed",
      permissionError.message,
    );
    throw new CoreError(
      "PERMISSION_LOAD_FAILED",
      "Failed to load permissions.",
    );
  }

  return new Set((permissionRows ?? []).map((row) => row.permission_key));
}

export async function assertPersonPermission(
  personId: string,
  permission: CorePermission | string,
): Promise<void> {
  const permissions = await getPermissionsForPerson(personId);
  if (!permissions.has(permission)) {
    throw new CoreError(
      "PERMISSION_DENIED",
      "You do not have permission to perform this action.",
    );
  }
}

export async function listRoles(): Promise<
  Array<{ key: string; label: string; description: string | null }>
> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("roles")
    .select("key, label, description")
    .order("key", { ascending: true });

  if (error) {
    console.error("listRoles failed", error.message);
    throw new CoreError("ROLE_LIST_FAILED", "Failed to list roles.");
  }

  return data ?? [];
}

export async function getPermissionsForRoles(
  roleKeys: Array<CoreRole | string>,
): Promise<Set<string>> {
  if (roleKeys.length === 0) return new Set();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("role_permissions")
    .select("permission_key")
    .in("role_key", roleKeys);

  if (error) {
    console.error("getPermissionsForRoles failed", error.message);
    throw new CoreError(
      "PERMISSION_LOAD_FAILED",
      "Failed to load role permissions.",
    );
  }

  return new Set((data ?? []).map((row) => row.permission_key));
}
