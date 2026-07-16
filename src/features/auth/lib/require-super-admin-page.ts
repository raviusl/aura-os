import "server-only";

import { redirect } from "next/navigation";

import { getSessionUser } from "@/features/auth/lib/get-session-user";
import { isSuperAdmin } from "@/features/auth/lib/platform-role";

export async function requireSuperAdminPage() {
  const user = await getSessionUser();

  if (!user || !isSuperAdmin(user)) {
    redirect("/dashboard/settings");
  }

  return user;
}

export async function getSessionIsSuperAdmin() {
  const user = await getSessionUser();
  return isSuperAdmin(user);
}
