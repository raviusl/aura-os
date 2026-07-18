import type { RoleId } from "./Role";

export type ProjectId = string;

/**
 * Associates a Role definition with a Project scope.
 */
export interface ProjectRole {
  projectId: ProjectId;
  roleId: RoleId;
}
