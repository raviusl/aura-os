import type { ActivityActorId } from "./ActivityActor";
import type { ActivityTargetType } from "./ActivityTarget";
import type { AuditActionId } from "./AuditAction";
import type { AuditResultId } from "./AuditResult";

export type AuditLogId = string;
export type AuditValue = unknown;

/**
 * Immutable audit record shape (Project 017 foundation).
 * Immutability and persistence are future implementation concerns.
 */
export interface AuditLog {
  id: AuditLogId;
  actorId: ActivityActorId;
  actionId: AuditActionId;
  entityType: ActivityTargetType;
  entityId: string;
  previousValue: AuditValue;
  newValue: AuditValue;
  resultId: AuditResultId;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}
