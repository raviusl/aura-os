import type { TaskId } from "./Task";

export type TaskDependencyRelationshipType = string;

/**
 * Directional dependency reference between two Tasks.
 */
export interface TaskDependency {
  taskId: TaskId;
  dependsOnTaskId: TaskId;
  relationshipType: TaskDependencyRelationshipType;
}
