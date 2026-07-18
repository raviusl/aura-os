import type { WorkspaceId } from "@/types/workspace";
import type { PersonId } from "./Person";
import type { PersonRoleReference } from "./PersonRoleReference";

export type WorkspaceMembershipId = string;

/**
 * Reference from one Person to one Workspace membership.
 */
export interface WorkspaceMembershipReference {
  id: WorkspaceMembershipId;
  personId: PersonId;
  workspaceId: WorkspaceId;
  roles: ReadonlyArray<PersonRoleReference>;
}
