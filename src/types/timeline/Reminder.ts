import type { EventId } from "./Event";
import type { ReminderTypeId } from "./ReminderType";

export type ReminderId = string;

/**
 * Time-based reminder reference for an Event.
 */
export interface Reminder {
  id: ReminderId;
  eventId: EventId;
  remindAt: string;
  reminderTypeId: ReminderTypeId;
}
