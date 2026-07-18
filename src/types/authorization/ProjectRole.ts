import type { RoleId } from "./Role";
import type { ProjectId } from "@/types/project/Project";

export type { ProjectId } from "@/types/project/Project";

/**
 * Associates a Role definition with a Project scope.
 */
export interface ProjectRole {
  projectId: ProjectId;
  roleId: RoleId;
}
