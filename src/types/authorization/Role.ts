/**
 * Authorization role definition (Project 008 foundation).
 * No assignment or permission evaluation logic.
 */
export const ROLE_SCOPES = ["workspace", "company", "project"] as const;

export type RoleScope = (typeof ROLE_SCOPES)[number];
export type RoleId = string;

export interface Role {
  id: RoleId;
  code: string;
  name: string;
  description: string | null;
  scope: RoleScope;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}
