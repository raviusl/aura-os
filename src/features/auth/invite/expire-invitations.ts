import "server-only";

import { writeInvitationAuditLog } from "@/features/auth/invite/audit";
import { createAdminClient } from "@/lib/supabase/admin";

export function isInvitationExpired(expiresAt: string, now = Date.now()) {
  return new Date(expiresAt).getTime() <= now;
}

/**
 * Marks pending invitations as expired and writes audit rows.
 * Shared by list, accept, and re-invite paths.
 */
export async function markInvitationsExpired(input: {
  ids: string[];
  reason: string;
  actorId?: string | null;
}) {
  const ids = [...new Set(input.ids.filter(Boolean))];
  if (ids.length === 0) return;

  const admin = createAdminClient();
  const { error } = await admin
    .from("invitations")
    .update({ status: "expired" })
    .in("id", ids)
    .eq("status", "pending");

  if (error) {
    throw new Error(error.message);
  }

  for (const id of ids) {
    await writeInvitationAuditLog({
      invitationId: id,
      action: "expired",
      actorId: input.actorId,
      metadata: { reason: input.reason },
    });
  }
}
