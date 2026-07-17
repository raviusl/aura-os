import type { Company, Membership, Workspace } from "@/core/types";

/** Client-safe session context (serializable from server SessionContext). */
export type ClientCompanyContext = {
  userId: string;
  workspace: Workspace;
  company: Company;
  membership: Membership;
  permissions: string[];
};

export type CompanyContextValue = {
  workspaceId: string | null;
  workspace: Workspace | null;
  company: Company | null;
  membership: Membership | null;
  permissions: string[];
  companies: Company[];
};

export function serializeSessionContext(input: {
  userId: string;
  workspace: Workspace;
  company: Company;
  membership: Membership;
  permissions: Set<string>;
}): ClientCompanyContext {
  return {
    userId: input.userId,
    workspace: input.workspace,
    company: input.company,
    membership: input.membership,
    permissions: [...input.permissions],
  };
}

export function toCompanyContextValue(input: {
  context: ClientCompanyContext | null;
  companies: Company[];
}): CompanyContextValue {
  if (!input.context) {
    return {
      workspaceId: null,
      workspace: null,
      company: null,
      membership: null,
      permissions: [],
      companies: input.companies,
    };
  }

  return {
    workspaceId: input.context.workspace.id,
    workspace: input.context.workspace,
    company: input.context.company,
    membership: input.context.membership,
    permissions: input.context.permissions,
    companies: input.companies,
  };
}
