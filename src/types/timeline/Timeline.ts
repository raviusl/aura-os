import type { ProjectId } from "@/types/project";

export type TimelineId = string;

/**
 * Time-based activity container within a Project.
 */
export interface Timeline {
  id: TimelineId;
  projectId: ProjectId;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}
