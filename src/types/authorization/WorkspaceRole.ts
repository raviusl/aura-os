import type { WorkspaceId } from "@/types/workspace";
import type { RoleId } from "./Role";

/**
 * Associates a Role definition with a Workspace scope.
 */
export interface WorkspaceRole {
  workspaceId: WorkspaceId;
  roleId: RoleId;
}
