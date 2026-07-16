import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

type AuditAction =
  | "created"
  | "emailed"
  | "email_failed"
  | "accepted"
  | "expired"
  | "revoked"
  | "resent";

export async function writeInvitationAuditLog(input: {
  invitationId: string | null;
  action: AuditAction;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from("invitation_audit_logs").insert({
    invitation_id: input.invitationId,
    action: input.action,
    actor_id: input.actorId ?? null,
    metadata: (input.metadata ?? {}) as Json,
  });

  if (error) {
    // Never fail the primary flow because of audit write issues; log server-side.
    console.error("invitation audit log failed", error.message);
  }
}
