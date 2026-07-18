import type { CompanyId } from "@/types/company";
import type { RoleId } from "./Role";

/**
 * Associates a Role definition with a Company scope.
 */
export interface CompanyRole {
  companyId: CompanyId;
  roleId: RoleId;
}
