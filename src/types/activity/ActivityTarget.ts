export const ACTIVITY_TARGET_TYPES = [
  "workspace",
  "company",
  "person",
  "client",
  "vendor",
  "project",
  "task",
  "timeline",
  "asset",
  "note",
  "comment",
  "ai_action",
] as const;

export type ActivityTargetType = (typeof ACTIVITY_TARGET_TYPES)[number];

/**
 * Polymorphic target of an Activity.
 */
export interface ActivityTarget {
  id: string;
  type: ActivityTargetType;
}
