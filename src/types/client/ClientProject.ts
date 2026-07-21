import type { ProjectId } from "@/types/project";
import type { ClientId } from "./Client";

export type ClientProjectRelationship = string;

/**
 * Client participation reference for one Project.
 */
export interface ClientProject {
  clientId: ClientId;
  projectId: ProjectId;
  relationship: ClientProjectRelationship;
}
