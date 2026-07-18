import type { PermissionId } from "./Permission";
import type { RoleId } from "./Role";

/**
 * Definition-only Role-to-Permission relationship.
 */
export interface PermissionReference {
  roleId: RoleId;
  permissionId: PermissionId;
}
