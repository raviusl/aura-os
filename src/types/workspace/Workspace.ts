/**
 * Workspace domain definitions (Sprint 004 foundation).
 * Types only — no database implementation.
 */
export const WORKSPACE_STATUSES = [
  "pending",
  "active",
  "suspended",
  "archived",
] as const;

export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];

export type WorkspaceId = string;

export interface Workspace {
  id: WorkspaceId;
  name: string;
  slug: string;
  status: WorkspaceStatus;
  timezone: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}
