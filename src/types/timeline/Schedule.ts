import type { EventId } from "./Event";

export type ScheduleId = string;

/**
 * Planned and actual timing reference for an Event.
 */
export interface Schedule {
  id: ScheduleId;
  eventId: EventId;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
}
