import type { CompanyId } from "@/types/company";
import type { WorkspaceId } from "@/types/workspace";
import type { PersonId } from "./Person";
import type { PersonRoleReference } from "./PersonRoleReference";

export type CompanyMembershipId = string;

/**
 * Reference from one Person to one Company membership.
 */
export interface CompanyMembershipReference {
  id: CompanyMembershipId;
  personId: PersonId;
  workspaceId: WorkspaceId;
  companyId: CompanyId;
  roles: ReadonlyArray<PersonRoleReference>;
}
