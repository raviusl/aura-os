import type { PersonId } from "@/types/people";
import type { ProjectId } from "@/types/project";
import type { TaskPriorityId } from "./TaskPriority";
import type { TaskStatusId } from "./TaskStatus";
import type { TaskTypeId } from "./TaskType";

export type TaskId = string;

/**
 * Smallest executable operational unit inside a Project.
 * No workflow, checklist, or automation behavior is embedded.
 */
export interface Task {
  id: TaskId;
  projectId: ProjectId;
  parentTaskId: TaskId | null;
  code: string;
  title: string;
  description: string | null;
  statusId: TaskStatusId;
  priorityId: TaskPriorityId;
  typeId: TaskTypeId;
  dueDate: string | null;
  startDate: string | null;
  completedAt: string | null;
  createdBy: PersonId;
  createdAt: string;
  updatedAt: string;
}
