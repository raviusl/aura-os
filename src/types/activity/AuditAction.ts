export type AuditActionId = string;

export const AUDIT_ACTION_CODES = [
  "created",
  "updated",
  "deleted",
  "restored",
  "assigned",
  "unassigned",
  "uploaded",
  "downloaded",
  "commented",
  "mentioned",
  "completed",
  "cancelled",
  "archived",
  "logged_in",
  "logged_out",
] as const;

export type AuditActionCode = (typeof AUDIT_ACTION_CODES)[number];

/**
 * Classification of an audited action.
 */
export interface AuditAction {
  id: AuditActionId;
  code: AuditActionCode;
  name: string;
  description: string | null;
}
