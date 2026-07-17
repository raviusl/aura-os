"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  activateProjectAction,
  archiveProjectAction,
  restoreProjectAction,
} from "@/core/actions/project-actions";
import type { Project } from "@/core/types";

type ProjectListItemProps = {
  workspaceId: string;
  companyId: string;
  project: Project;
  canWrite: boolean;
};

function statusLabel(status: Project["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function ProjectListItem({
  workspaceId,
  companyId,
  project,
  canWrite,
}: ProjectListItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{project.name}</p>
          <p className="mt-1 truncate text-xs text-white/45">
            {statusLabel(project.status)}
            {project.project_type ? ` · ${project.project_type}` : ""}
          </p>
        </div>
        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            {project.status !== "archived" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  router.push(`/dashboard/projects/${project.id}/edit`)
                }
              >
                Edit
              </Button>
            ) : null}
            {project.status === "draft" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await activateProjectAction({
                      workspaceId,
                      companyId,
                      projectId: project.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Project activated");
                    router.refresh();
                  });
                }}
              >
                Activate
              </Button>
            ) : null}
            {project.status === "active" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await archiveProjectAction({
                      workspaceId,
                      companyId,
                      projectId: project.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Project archived");
                    router.refresh();
                  });
                }}
              >
                Archive
              </Button>
            ) : null}
            {project.status === "archived" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await restoreProjectAction({
                      workspaceId,
                      companyId,
                      projectId: project.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Project restored");
                    router.refresh();
                  });
                }}
              >
                Restore
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
