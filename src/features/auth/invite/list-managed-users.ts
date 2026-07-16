import "server-only";

import { assertSuperAdmin } from "@/features/auth/lib/assert-super-admin";
import { InvitationError } from "@/features/auth/invite/errors";
import { createAdminClient } from "@/lib/supabase/admin";

export type ManagedUser = {
  id: string;
  email: string;
  fullName: string;
  company: string | null;
  role: string | null;
  createdAt: string;
};

export async function listManagedUsers(): Promise<ManagedUser[]> {
  await assertSuperAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin.rpc("list_managed_users");

  if (error) {
    console.error("list_managed_users failed", error.message);
    throw new InvitationError("Failed to load users.");
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    email: row.email ?? "",
    fullName: row.full_name?.trim() || row.display_name?.trim() || "—",
    company: row.company,
    role: row.role,
    createdAt: row.created_at,
  }));
}
