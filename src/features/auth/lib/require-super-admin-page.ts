import "server-only";

import { redirect } from "next/navigation";

import { isSuperAdmin } from "@/features/auth/lib/platform-role";
import { createClient } from "@/lib/supabase/server";

export async function requireSuperAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdmin(user)) {
    redirect("/dashboard/settings");
  }

  return user;
}

export async function getSessionIsSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isSuperAdmin(user);
}
