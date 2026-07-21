export type ClientStatusId = string;

/**
 * Named lifecycle status for a Client relationship.
 */
export interface ClientStatus {
  id: ClientStatusId;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
}
