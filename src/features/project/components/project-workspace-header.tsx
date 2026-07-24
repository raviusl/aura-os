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

type ProjectWorkspaceHeaderProps = {
  workspaceId: string;
  companyId: string;
  project: Project;
  canWriteProject: boolean;
};

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function ProjectWorkspaceHeader({
  workspaceId,
  companyId,
  project,
  canWriteProject,
}: ProjectWorkspaceHeaderProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-white/40">Project Workspace</p>
          <h1 className="mt-1 truncate text-xl text-white">{project.name}</h1>
          <p className="mt-2 text-sm text-white/45">
            {statusLabel(project.status)}
            {project.project_type ? ` · ${project.project_type}` : ""}
          </p>
        </div>

        {canWriteProject ? (
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
    </section>
  );
}
