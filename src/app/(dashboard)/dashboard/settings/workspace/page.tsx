import Link from "next/link";
import { redirect } from "next/navigation";

import { requireSessionUserId } from "@/core/auth/session";
import { getPermissionsForPerson } from "@/core/permissions/rbac";
import { getPersonByUserAndWorkspace } from "@/core/people/people";
import { resolveActiveWorkspace } from "@/core/workspace/active-workspace";
import { WorkspaceSettingsForm } from "@/features/workspace/components/workspace-settings-form";

export default async function WorkspaceSettingsPage() {
  const userId = await requireSessionUserId();
  const workspace = await resolveActiveWorkspace(userId);

  if (!workspace) {
    redirect("/dashboard/workspaces/new");
  }

  const person = await getPersonByUserAndWorkspace(userId, workspace.id);
  const permissions = person
    ? await getPermissionsForPerson(person.id)
    : new Set<string>();
  const canWrite = permissions.has("workspace.write");

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <Link
          href="/dashboard/settings"
          className="text-xs text-white/40 hover:text-white/70"
        >
          ← Settings
        </Link>
        <h1 className="mt-3 text-xl text-white">Workspace settings</h1>
        <p className="mt-2 text-sm text-white/45">
          Basic information for{" "}
          <span className="text-white/70">{workspace.name}</span>.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <WorkspaceSettingsForm workspace={workspace} canWrite={canWrite} />
      </div>
    </div>
  );
}
