import type { CompanyId } from "./Company";

/**
 * Optional descriptive and regional company metadata.
 * Definition only — persistence remains in existing core modules.
 */
export interface CompanyMetadata {
  companyId: CompanyId;
  logoUrl: string | null;
  country: string | null;
  timezone: string | null;
  locale: string | null;
  currency: string | null;
}
