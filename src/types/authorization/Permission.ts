/**
 * Atomic permission definition (Project 008 foundation).
 * Module and action remain extensible domain identifiers.
 */
export type PermissionId = string;
export type PermissionModule = string;
export type PermissionAction = string;

export interface Permission {
  id: PermissionId;
  code: string;
  name: string;
  description: string | null;
  module: PermissionModule;
  action: PermissionAction;
  createdAt: string;
  updatedAt: string;
}
