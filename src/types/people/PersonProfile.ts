import type { PersonId } from "./Person";

/**
 * Descriptive attributes for a Person identity.
 */
export interface PersonProfile {
  personId: PersonId;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}
