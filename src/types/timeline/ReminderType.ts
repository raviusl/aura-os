export type ReminderTypeId = string;

/**
 * Descriptive classification for an Event Reminder.
 */
export interface ReminderType {
  id: ReminderTypeId;
  code: string;
  name: string;
  description: string | null;
}
