export type TaskPriorityId = string;

/**
 * Ordered urgency definition for a Task.
 */
export interface TaskPriority {
  id: TaskPriorityId;
  code: string;
  name: string;
  description: string | null;
  level: number;
  color: string | null;
}
