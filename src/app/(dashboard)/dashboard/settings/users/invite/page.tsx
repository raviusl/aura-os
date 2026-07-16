import { redirect } from "next/navigation";

import { requireSuperAdminPage } from "@/features/auth/lib/require-super-admin-page";

/** Invite UI lives in the User Management dialog. */
export default async function InviteUserPage() {
  await requireSuperAdminPage();
  redirect("/dashboard/settings/users?invite=1");
}
