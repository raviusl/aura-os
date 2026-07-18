import type { WorkspaceId } from "@/types/workspace";
import type { CompanyId } from "./Company";

/**
 * Known Company aggregate relationships (Project 005 foundation).
 * Child domain collections are intentionally not embedded.
 */
export interface CompanyRelationships {
  companyId: CompanyId;
  workspaceId: WorkspaceId;
}
