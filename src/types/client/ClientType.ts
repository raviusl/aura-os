export type ClientTypeId = string;

/**
 * Descriptive classification for a Client.
 * Examples such as Bride, Groom, Corporate, Individual, and Family are data,
 * not seeded by this foundation.
 */
export interface ClientType {
  id: ClientTypeId;
  code: string;
  name: string;
  description: string | null;
}
