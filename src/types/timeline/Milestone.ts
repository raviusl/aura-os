import type { TimelineId } from "./Timeline";

export type MilestoneId = string;

/**
 * Ordered target point within a Timeline.
 */
export interface Milestone {
  id: MilestoneId;
  timelineId: TimelineId;
  name: string;
  description: string | null;
  dueDate: string | null;
  sequence: number;
}
