import { InvitationsTable } from "@/features/auth/components/invitations-table";
import { listInvitations } from "@/features/auth/invite/list-invitations";
import { requireSuperAdminPage } from "@/features/auth/lib/require-super-admin-page";

export default async function UserManagementPage() {
  await requireSuperAdminPage();
  const invitations = await listInvitations();
  return <InvitationsTable invitations={invitations} />;
}
