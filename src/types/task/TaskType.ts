export type TaskTypeId = string;

/**
 * Descriptive classification for a Task.
 */
export interface TaskType {
  id: TaskTypeId;
  code: string;
  name: string;
  description: string | null;
}
