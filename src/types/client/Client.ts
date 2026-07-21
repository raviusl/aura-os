import type { CompanyId } from "@/types/company";
import type { PersonId } from "@/types/people";
import type { WorkspaceId } from "@/types/workspace";
import type { ClientStatusId } from "./ClientStatus";
import type { ClientTypeId } from "./ClientType";

export type ClientId = string;

/**
 * Client participation identity extending one canonical Person.
 */
export interface Client {
  id: ClientId;
  personId: PersonId;
  workspaceId: WorkspaceId;
  companyId: CompanyId;
  clientTypeId: ClientTypeId;
  statusId: ClientStatusId;
  createdAt: string;
  updatedAt: string;
}
