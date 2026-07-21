import type { PersonContactId } from "@/types/people";
import type { ClientId } from "./Client";

/**
 * Reference to a contact point owned by the Client's Person identity.
 */
export interface ClientContact {
  clientId: ClientId;
  contactId: PersonContactId;
}
