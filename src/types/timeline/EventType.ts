export type EventTypeId = string;

/**
 * Descriptive classification for a Timeline Event.
 */
export interface EventType {
  id: EventTypeId;
  code: string;
  name: string;
  description: string | null;
}
