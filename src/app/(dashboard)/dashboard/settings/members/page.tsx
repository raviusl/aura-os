import Link from "next/link";
import { redirect } from "next/navigation";

import { listWorkspaceInvitations } from "@/core/auth/invitation";
import { requireSessionUserId } from "@/core/auth/session";
import { listWorkspaceMembers } from "@/core/membership/membership";
import { getPermissionsForPerson } from "@/core/permissions/rbac";
import { getPersonByUserAndWorkspace } from "@/core/people/people";
import { resolveActiveWorkspace } from "@/core/workspace/active-workspace";
import { InviteMemberForm } from "@/features/membership/components/invite-member-form";
import { MembersPanel } from "@/features/membership/components/members-panel";

export default async function MembersSettingsPage() {
  const userId = await requireSessionUserId();
  const workspace = await resolveActiveWorkspace(userId);

  if (!workspace) {
    redirect("/dashboard/workspaces/new");
  }

  const person = await getPersonByUserAndWorkspace(userId, workspace.id);
  if (!person || person.status !== "accepted") {
    redirect("/dashboard/workspaces");
  }

  const permissions = await getPermissionsForPerson(person.id);
  const canRead = permissions.has("people.read");
  if (!canRead) {
    return (
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/[0.08] px-5 py-8 text-sm text-white/55">
        You do not have permission to view members in this workspace.
      </div>
    );
  }

  const [members, invitations] = await Promise.all([
    listWorkspaceMembers(workspace.id),
    listWorkspaceInvitations(workspace.id),
  ]);

  const canInvite = permissions.has("people.invite");
  const canWrite = permissions.has("people.write");
  const canAssignRole = permissions.has("people.assign_role");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div>
        <Link
          href="/dashboard/settings"
          className="text-xs text-white/40 hover:text-white/70"
        >
          ← Settings
        </Link>
        <h1 className="mt-3 text-xl text-white">Members</h1>
        <p className="mt-2 text-sm text-white/45">
          Workspace membership for{" "}
          <span className="text-white/70">{workspace.name}</span>. Roles:
          Owner, Admin, Member, Viewer, Guest.
        </p>
      </div>

      {canInvite ? (
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h2 className="mb-4 text-sm font-medium text-white">
            Invite member
          </h2>
          <InviteMemberForm workspaceId={workspace.id} />
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <MembersPanel
          workspaceId={workspace.id}
          members={members}
          invitations={invitations}
          canInvite={canInvite}
          canWrite={canWrite}
          canAssignRole={canAssignRole}
        />
      </div>
    </div>
  );
}
