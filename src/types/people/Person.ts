import type { PersonStatus } from "./PersonStatus";

export type PersonId = string;

/**
 * One human identity, independent of workspace and company membership.
 */
export interface Person {
  id: PersonId;
  status: PersonStatus;
  createdAt: string;
  updatedAt: string;
}
