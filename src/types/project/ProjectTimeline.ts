import type { ProjectId } from "./Project";

/**
 * Definition-only Project milestone reference.
 * Timeline calculation and workflow are outside Project 009.
 */
export interface ProjectTimeline {
  projectId: ProjectId;
  milestone: string;
  plannedDate: string | null;
  actualDate: string | null;
}
