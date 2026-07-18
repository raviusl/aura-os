import type { CompanyId } from "@/types/company";
import type { WorkspaceId } from "@/types/workspace";
import type { PersonId } from "./Person";

export const PERSON_ROLE_SCOPES = ["workspace", "company"] as const;

export type PersonRoleScope = (typeof PERSON_ROLE_SCOPES)[number];

/**
 * Reference to a role assignment without embedding permission logic.
 */
export interface PersonRoleReference {
  personId: PersonId;
  roleKey: string;
  scope: PersonRoleScope;
  workspaceId: WorkspaceId;
  companyId: CompanyId | null;
}
