import type { PersonId } from "@/types/people";
import type { RoleId, RoleScope } from "./Role";

/**
 * References a Person's Role within one authorization scope.
 */
export interface RoleAssignment {
  personId: PersonId;
  roleId: RoleId;
  scope: RoleScope;
  scopeId: string;
}
