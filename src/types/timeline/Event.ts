import type { TaskId } from "@/types/task";
import type { EventTypeId } from "./EventType";
import type { TimelineId } from "./Timeline";

export type EventId = string;

/**
 * Scheduled activity inside a Timeline.
 */
export interface Event {
  id: EventId;
  timelineId: TimelineId;
  taskId: TaskId | null;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  eventTypeId: EventTypeId;
}
