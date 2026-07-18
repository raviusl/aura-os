import type { CompanyId } from "@/types/company";
import type { PersonId } from "@/types/people";
import type { WorkspaceId } from "@/types/workspace";
import type { ProjectStageId } from "./ProjectStage";
import type { ProjectStatusId } from "./ProjectStatus";
import type { ProjectTypeId } from "./ProjectType";

export type ProjectId = string;

/**
 * Core operational Project identity (Project 009 foundation).
 * No lifecycle or workflow behavior is embedded.
 */
export interface Project {
  id: ProjectId;
  workspaceId: WorkspaceId;
  companyId: CompanyId;
  code: string;
  name: string;
  description: string | null;
  typeId: ProjectTypeId;
  statusId: ProjectStatusId;
  stageId: ProjectStageId;
  startDate: string | null;
  endDate: string | null;
  ownerId: PersonId | null;
  createdAt: string;
  updatedAt: string;
}
