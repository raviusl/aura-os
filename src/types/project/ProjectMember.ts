import type { RoleId } from "@/types/authorization";
import type { PersonId } from "@/types/people";
import type { ProjectId } from "./Project";

/**
 * Person participation reference for a Project.
 */
export interface ProjectMember {
  projectId: ProjectId;
  personId: PersonId;
  roleId: RoleId;
}
