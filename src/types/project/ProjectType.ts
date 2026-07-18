export type ProjectTypeId = string;

/**
 * Descriptive classification for a Project.
 */
export interface ProjectType {
  id: ProjectTypeId;
  code: string;
  name: string;
  description: string | null;
}
