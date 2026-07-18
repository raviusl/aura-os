/**
 * Company domain definitions (Project 005 foundation).
 * Types only — no database or repository implementation.
 */
export const COMPANY_STATUSES = [
  "active",
  "suspended",
  "archived",
] as const;

export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const COMPANY_TYPES = [
  "agency",
  "brand",
  "venue",
  "corporate",
  "wedding",
  "other",
] as const;

export type CompanyType = (typeof COMPANY_TYPES)[number];

export type CompanyId = string;

export interface Company {
  id: CompanyId;
  name: string;
  slug: string;
  status: CompanyStatus;
  type: CompanyType | null;
  createdAt: string;
  updatedAt: string;
}
