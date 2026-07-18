/**
 * Descriptive grouping for related permissions.
 * Membership of permissions in a group is intentionally not modeled yet.
 */
export type PermissionGroupId = string;

export interface PermissionGroup {
  id: PermissionGroupId;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
