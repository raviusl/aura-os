import type { CompanyId } from "@/types/company";
import type { WorkspaceId } from "@/types/workspace";
import type { ProjectId } from "./Project";

/**
 * Minimal tenancy reference for a Project.
 */
export interface ProjectReference {
  projectId: ProjectId;
  workspaceId: WorkspaceId;
  companyId: CompanyId;
}
