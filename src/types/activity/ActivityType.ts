export type ActivityTypeId = string;

export const ACTIVITY_TYPE_CODES = [
  "created",
  "updated",
  "deleted",
  "restored",
  "assigned",
  "unassigned",
  "uploaded",
  "downloaded",
  "commented",
  "mentioned",
  "completed",
  "cancelled",
  "archived",
  "logged_in",
  "logged_out",
] as const;

export type ActivityTypeCode = (typeof ACTIVITY_TYPE_CODES)[number];

/**
 * Reusable classification for an Activity event.
 */
export interface ActivityType {
  id: ActivityTypeId;
  code: ActivityTypeCode;
  name: string;
  description: string | null;
}
