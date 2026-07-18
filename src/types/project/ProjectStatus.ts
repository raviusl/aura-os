export type ProjectStatusId = string;

/**
 * Named lifecycle status for a Project.
 */
export interface ProjectStatus {
  id: ProjectStatusId;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
}
