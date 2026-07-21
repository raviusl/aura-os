import type { CompanyId } from "@/types/company";
import type { ProjectId } from "@/types/project";
import type { WorkspaceId } from "@/types/workspace";
import type { TimelineId } from "./Timeline";

/**
 * Minimal tenancy and Project reference for a Timeline.
 */
export interface TimelineReference {
  timelineId: TimelineId;
  projectId: ProjectId;
  workspaceId: WorkspaceId;
  companyId: CompanyId;
}
