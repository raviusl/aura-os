/**
 * Foundation permission shapes (Sprint 003).
 * Constants and interfaces only — no evaluation logic.
 */
export const AUTH_PERMISSION_ACTIONS = [
  "read",
  "write",
  "manage",
  "invite",
] as const;

export type AuthPermissionAction = (typeof AUTH_PERMISSION_ACTIONS)[number];

export const AUTH_PERMISSION_RESOURCES = [
  "workspace",
  "company",
  "project",
  "client",
  "vendor",
  "people",
  "permission",
] as const;

export type AuthPermissionResource =
  (typeof AUTH_PERMISSION_RESOURCES)[number];

export type AuthPermissionKey = `${AuthPermissionResource}.${AuthPermissionAction}`;

export type AuthPermissionDefinition = {
  key: AuthPermissionKey | string;
  resource: AuthPermissionResource | string;
  action: AuthPermissionAction | string;
  description?: string;
};

export interface AuthPermissionSet {
  keys: ReadonlyArray<string>;
}
