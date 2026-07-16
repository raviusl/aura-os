import "server-only";

import { assertSuperAdmin } from "@/features/auth/lib/assert-super-admin";
import { writeInvitationAuditLog } from "@/features/auth/invite/audit";
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
    throw new Error(error.message);
  }

  const now = Date.now();
  const rows = data ?? [];
  const expiredIds = rows
    .filter(
      (row) =>
        row.status === "pending" && new Date(row.expires_at).getTime() <= now,
    )
    .map((row) => row.id);

  if (expiredIds.length > 0) {
    await admin
      .from("invitations")
      .update({ status: "expired" })
      .in("id", expiredIds)
      .eq("status", "pending");

    for (const id of expiredIds) {
      await writeInvitationAuditLog({
        invitationId: id,
        action: "expired",
        metadata: { reason: "checked_on_list" },
      });
    }

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
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Only pending invitations can be revoked.");
  }

  await writeInvitationAuditLog({
    invitationId: data.id,
    action: "revoked",
    actorId: actor.id,
  });
}
