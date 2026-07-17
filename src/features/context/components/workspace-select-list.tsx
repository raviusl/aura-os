"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { selectWorkspaceAndContinueAction } from "@/core/actions/context-actions";
import type { Workspace } from "@/core/types";

type WorkspaceSelectListProps = {
  workspaces: Workspace[];
};

export function WorkspaceSelectList({ workspaces }: WorkspaceSelectListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <ul className="space-y-2">
      {workspaces.map((workspace) => (
        <li key={workspace.id}>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await selectWorkspaceAndContinueAction({
                  workspaceId: workspace.id,
                });
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                router.push("/dashboard/select-company");
                router.refresh();
              });
            }}
            className="block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left transition-colors hover:bg-white/[0.06] disabled:opacity-60"
          >
            <p className="text-sm font-medium text-white">{workspace.name}</p>
            <p className="mt-1 text-xs text-white/40">{workspace.slug}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
