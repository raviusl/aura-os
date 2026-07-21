import type { PersonId } from "@/types/people";

export type ActivityActorId = string;

export const ACTIVITY_ACTOR_TYPES = ["person", "system", "ai"] as const;

export type ActivityActorType = (typeof ACTIVITY_ACTOR_TYPES)[number];

/**
 * Identity responsible for an Activity or Audit record.
 * System and AI actors intentionally do not require a Person reference.
 */
export interface ActivityActor {
  id: ActivityActorId;
  type: ActivityActorType;
  personId: PersonId | null;
  label: string | null;
}
