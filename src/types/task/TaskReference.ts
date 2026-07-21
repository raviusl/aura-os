import type { CompanyId } from "@/types/company";
import type { ProjectId } from "@/types/project";
import type { WorkspaceId } from "@/types/workspace";
import type { TaskId } from "./Task";

/**
 * Minimal tenancy and Project reference for a Task.
 */
export interface TaskReference {
  taskId: TaskId;
  projectId: ProjectId;
  workspaceId: WorkspaceId;
  companyId: CompanyId;
}
