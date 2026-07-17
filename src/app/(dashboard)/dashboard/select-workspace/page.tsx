import Link from "next/link";

import { requireSessionUserId } from "@/core/auth/session";
import { listWorkspacesForUser } from "@/core/workspace/active-workspace";
import { WorkspaceSelectList } from "@/features/context/components/workspace-select-list";

export default async function SelectWorkspacePage() {
  const userId = await requireSessionUserId();
  const workspaces = await listWorkspacesForUser(userId);

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div>
        <h1 className="text-xl text-white">Select workspace</h1>
        <p className="mt-2 text-sm text-white/45">
          Choose a workspace to continue. You can switch later from the header.
        </p>
      </div>

      {workspaces.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-sm text-white/45">
          No workspaces yet.{" "}
          <Link href="/dashboard/workspaces/new" className="text-white/70">
            Create one
          </Link>
        </div>
      ) : (
        <WorkspaceSelectList workspaces={workspaces} />
      )}
    </div>
  );
}
