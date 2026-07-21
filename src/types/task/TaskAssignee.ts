import type { RoleId } from "@/types/authorization";
import type { PersonId } from "@/types/people";
import type { TaskId } from "./Task";

/**
 * Person assignment reference for a Task.
 */
export interface TaskAssignee {
  taskId: TaskId;
  personId: PersonId;
  roleId: RoleId;
}
