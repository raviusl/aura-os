export type ProjectStageId = string;

/**
 * Ordered phase within a Project lifecycle.
 */
export interface ProjectStage {
  id: ProjectStageId;
  code: string;
  name: string;
  description: string | null;
  sequence: number;
}
