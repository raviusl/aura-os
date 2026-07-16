import { InviteUserForm } from "@/features/auth/components/invite-user-form";
import { requireSuperAdminPage } from "@/features/auth/lib/require-super-admin-page";

export default async function InviteUserPage() {
  await requireSuperAdminPage();
  return <InviteUserForm />;
}
