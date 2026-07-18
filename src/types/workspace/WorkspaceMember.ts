import type { AuthRoleKey } from "@/types/auth";
import type { WorkspaceId } from "./Workspace";

/**
 * Workspace membership definitions (Sprint 004 foundation).
 * Definition only — assignment and persistence stay in existing core modules.
 */
export const WORKSPACE_INVITATION_STATUSES = [
  "pending",
  "accepted",
  "expired",
  "revoked",
] as const;

export type WorkspaceInvitationStatus =
  (typeof WORKSPACE_INVITATION_STATUSES)[number];

export interface WorkspaceMember {
  userId: string;
  workspaceId: WorkspaceId;
  role: AuthRoleKey;
  invitationStatus: WorkspaceInvitationStatus;
}
