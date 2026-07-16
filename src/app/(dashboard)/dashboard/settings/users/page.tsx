import { UserManagementView } from "@/features/auth/components/user-management-view";
import { listInvitations } from "@/features/auth/invite/list-invitations";
import { listManagedUsers } from "@/features/auth/invite/list-managed-users";
import { requireSuperAdminPage } from "@/features/auth/lib/require-super-admin-page";

type PageProps = {
  searchParams: Promise<{ invite?: string }>;
};

export default async function UserManagementPage({ searchParams }: PageProps) {
  await requireSuperAdminPage();
  const params = await searchParams;
  const [users, invitations] = await Promise.all([
    listManagedUsers(),
    listInvitations(),
  ]);

  return (
    <UserManagementView
      users={users}
      invitations={invitations}
      initialInviteOpen={params.invite === "1"}
    />
  );
}
