import type { CompanyId } from "@/types/company";
import type { ProjectId } from "@/types/project";
import type { WorkspaceId } from "@/types/workspace";
import type { ActivityAction } from "./ActivityAction";
import type { ActivityActor } from "./ActivityActor";
import type { ActivityCategory } from "./ActivityCategory";
import type { ActivityResult } from "./ActivityResult";
import type { ActivityTarget } from "./ActivityTarget";
import type { ActivityVisibility } from "./ActivityVisibility";

export type ActivityId = string;
export type ActivityMetadata = Readonly<Record<string, unknown>>;

/**
 * Universal timeline event across RIVA domains.
 */
export interface Activity {
  id: ActivityId;
  workspaceId: WorkspaceId;
  companyId: CompanyId | null;
  projectId: ProjectId | null;
  actor: ActivityActor;
  target: ActivityTarget;
  action: ActivityAction;
  category: ActivityCategory;
  result: ActivityResult;
  visibility: ActivityVisibility;
  metadata: ActivityMetadata;
  createdAt: string;
}
