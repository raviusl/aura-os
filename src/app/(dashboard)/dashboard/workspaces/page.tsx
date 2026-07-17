import Link from "next/link";

import { requireSessionUserId } from "@/core/auth/session";
import {
  listWorkspacesForUser,
  resolveActiveWorkspace,
} from "@/core/workspace/active-workspace";
import { WorkspaceListItem } from "@/features/workspace/components/workspace-list-item";

export default async function WorkspacesPage() {
  const userId = await requireSessionUserId();
  const [workspaces, activeWorkspace] = await Promise.all([
    listWorkspacesForUser(userId),
    resolveActiveWorkspace(userId),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl text-white">Workspaces</h1>
          <p className="mt-2 text-sm text-white/45">
            Create and switch between workspaces. Soft-archive only — no
            permanent delete.
          </p>
        </div>
        <Link
          href="/dashboard/workspaces/new"
          className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          Create
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-sm text-white/45">
          You do not belong to any workspace yet. Create one to get started.
        </div>
      ) : (
        <ul className="space-y-3">
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <WorkspaceListItem
                workspace={workspace}
                active={workspace.id === activeWorkspace?.id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
