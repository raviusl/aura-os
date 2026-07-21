import type { CompanyId } from "@/types/company";
import type { ProjectId } from "@/types/project";
import type { WorkspaceId } from "@/types/workspace";
import type { ActivityActorId } from "./ActivityActor";
import type { ActivityCategoryId } from "./ActivityCategory";
import type { ActivityTargetType } from "./ActivityTarget";
import type { ActivityTypeId } from "./ActivityType";

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
  actorId: ActivityActorId;
  targetId: string;
  targetType: ActivityTargetType;
  activityTypeId: ActivityTypeId;
  categoryId: ActivityCategoryId;
  title: string;
  description: string | null;
  metadata: ActivityMetadata;
  createdAt: string;
}
