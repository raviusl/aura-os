export type AuditResultId = string;

export const AUDIT_RESULT_CODES = ["success", "failed", "denied"] as const;

export type AuditResultCode = (typeof AUDIT_RESULT_CODES)[number];

/**
 * Outcome classification for an Audit record.
 */
export interface AuditResult {
  id: AuditResultId;
  code: AuditResultCode;
  name: string;
  description: string | null;
}
