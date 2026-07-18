import type { CompanyMembershipReference } from "./CompanyMembershipReference";
import type { PersonId } from "./Person";
import type { PersonContact } from "./PersonContact";
import type { PersonRoleReference } from "./PersonRoleReference";
import type { WorkspaceMembershipReference } from "./WorkspaceMembershipReference";

/**
 * Relationship references for one Person identity.
 * Future Project participation can be added without changing Person identity.
 */
export interface PersonRelationship {
  personId: PersonId;
  contacts: ReadonlyArray<PersonContact>;
  workspaceMemberships: ReadonlyArray<WorkspaceMembershipReference>;
  companyMemberships: ReadonlyArray<CompanyMembershipReference>;
  roles: ReadonlyArray<PersonRoleReference>;
}
