import type {
  Activity,
  ActivityActor,
  ActivityMetadata,
  ActivityTarget,
} from "@/types/activity";

/**
 * Scope fields shared by Activity producers.
 */
export type ActivityScope = Pick<
  Activity,
  "workspaceId" | "companyId" | "projectId"
>;

/**
 * Activity payload before persistence assigns identity and timestamp.
 */
export type ActivityDraft = Omit<Activity, "id" | "createdAt">;

/**
 * Reusable actor-target context for future Activity producers.
 */
export interface ActivityContext {
  actor: ActivityActor;
  target: ActivityTarget;
}

/**
 * Strongly typed metadata helper without imposing a metadata schema.
 */
export type ActivityMetadataOf<
  T extends Record<string, unknown>,
> = ActivityMetadata & Readonly<T>;
