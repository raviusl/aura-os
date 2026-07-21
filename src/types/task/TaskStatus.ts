export type TaskStatusId = string;

/**
 * Named lifecycle status for a Task.
 */
export interface TaskStatus {
  id: TaskStatusId;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
}
