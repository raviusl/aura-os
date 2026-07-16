import "server-only";

import { assertSuperAdmin } from "@/features/auth/lib/assert-super-admin";
import { writeInvitationAuditLog } from "@/features/auth/invite/audit";
import { InvitationError } from "@/features/auth/invite/errors";
import {
  isInvitationExpired,
  markInvitationsExpired,
} from "@/features/auth/invite/expire-invitations";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/types/database";

export type InvitationListItem = Tables<"invitations">;

export async function listInvitations(): Promise<InvitationListItem[]> {
  await assertSuperAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("invitations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("list invitations failed", error.message);
    throw new InvitationError("Failed to load invitations.");
  }

  const now = Date.now();
  const rows = data ?? [];
  const expiredIds = rows
    .filter(
      (row) => row.status === "pending" && isInvitationExpired(row.expires_at, now),
    )
    .map((row) => row.id);

  if (expiredIds.length > 0) {
    await markInvitationsExpired({
      ids: expiredIds,
      reason: "checked_on_list",
    });

    return rows.map((row) =>
      expiredIds.includes(row.id) ? { ...row, status: "expired" } : row,
    );
  }

  return rows;
}

export async function revokeInvitation(invitationId: string) {
  const actor = await assertSuperAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("revoke invitation failed", error.message);
    throw new InvitationError("Failed to revoke invitation.");
  }
  if (!data) {
    throw new InvitationError("Only pending invitations can be revoked.");
  }

  await writeInvitationAuditLog({
    invitationId: data.id,
    action: "revoked",
    actorId: actor.id,
  });
}
