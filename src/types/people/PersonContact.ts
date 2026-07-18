import type { PersonId } from "./Person";

export const PERSON_CONTACT_TYPES = [
  "email",
  "phone",
  "address",
  "other",
] as const;

export type PersonContactType = (typeof PERSON_CONTACT_TYPES)[number];
export type PersonContactId = string;

/**
 * A Person may own multiple contact points.
 */
export interface PersonContact {
  id: PersonContactId;
  personId: PersonId;
  type: PersonContactType;
  value: string;
  label: string | null;
  isPrimary: boolean;
}
