import type { PersonId } from "@/types/people";

export type ActivityActorId = string;

export enum ActivityActorType {
  Person = "person",
  System = "system",
  AI = "ai",
  Automation = "automation",
}

export const ACTIVITY_ACTOR_TYPES: readonly ActivityActorType[] = [
  ActivityActorType.Person,
  ActivityActorType.System,
  ActivityActorType.AI,
  ActivityActorType.Automation,
];

/**
 * Identity responsible for an Activity or Audit record.
 * System, AI, and Automation actors do not require a Person reference.
 */
export interface ActivityActor {
  id: ActivityActorId;
  type: ActivityActorType;
  personId: PersonId | null;
  label: string | null;
}
