/**
 * RIVA Sprint 009 — Core Foundation types
 * Workspace (root) → Company → People / Projects
 */

export const WORKSPACE_STATUSES = [
  "provisioning",
  "active",
  "suspended",
  "archived",
] as const;
export type WorkspaceStatus = (typeof WORKSPACE_STATUSES)[number];

export const COMPANY_STATUSES = ["active", "suspended", "archived"] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const PERSON_STATUSES = [
  "invited",
  "active",
  "disabled",
  "archived",
] as const;
export type PersonStatus = (typeof PERSON_STATUSES)[number];

export const PROJECT_STATUSES = ["draft", "active", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_TYPES = [
  "wedding",
  "corporate",
  "birthday",
  "concert",
  "exhibition",
  "other",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const CORE_ROLES = [
  "owner",
  "admin",
  "planner",
  "coordinator",
  "finance",
  "vendor",
  "client",
] as const;
export type CoreRole = (typeof CORE_ROLES)[number];

export const CORE_PERMISSIONS = [
  "workspace.read",
  "workspace.write",
  "company.read",
  "company.write",
  "people.read",
  "people.write",
  "people.invite",
  "people.assign_role",
  "project.read",
  "project.write",
  "permission.manage",
] as const;
export type CorePermission = (typeof CORE_PERMISSIONS)[number];

export const INVITATION_STATUSES = [
  "pending",
  "accepted",
  "expired",
  "revoked",
] as const;
export type CoreInvitationStatus = (typeof INVITATION_STATUSES)[number];

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  status: WorkspaceStatus;
  timezone: string;
  locale: string;
  currency: string;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  status: CompanyStatus;
  country: string | null;
  timezone: string | null;
  locale: string | null;
  currency: string | null;
  created_at: string;
  updated_at: string;
};

export type Person = {
  id: string;
  workspace_id: string;
  company_id: string | null;
  user_id: string | null;
  email: string;
  full_name: string;
  status: PersonStatus;
  created_at: string;
  updated_at: string;
};

export type PersonRole = {
  id: string;
  person_id: string;
  role_key: CoreRole | string;
  created_at: string;
};

export type Project = {
  id: string;
  workspace_id: string;
  company_id: string;
  name: string;
  project_type: ProjectType | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type CoreInvitation = {
  id: string;
  workspace_id: string;
  company_id: string | null;
  email: string;
  full_name: string;
  role_key: CoreRole | string;
  token_hash: string;
  status: CoreInvitationStatus;
  invited_by_user_id: string | null;
  invited_person_id: string | null;
  expires_at: string;
  accepted_at: string | null;
  accepted_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkspaceContext = {
  workspaceId: string;
  companyId?: string | null;
  personId?: string | null;
  userId: string;
};
