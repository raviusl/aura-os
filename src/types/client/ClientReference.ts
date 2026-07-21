import type { CompanyId } from "@/types/company";
import type { PersonId } from "@/types/people";
import type { WorkspaceId } from "@/types/workspace";
import type { ClientId } from "./Client";

/**
 * Minimal identity and tenancy reference for a Client.
 */
export interface ClientReference {
  clientId: ClientId;
  personId: PersonId;
  workspaceId: WorkspaceId;
  companyId: CompanyId;
}
