"use client";

import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { toast } from "sonner";

import {
  WorkspaceHeader,
  type WorkspaceHeaderAction,
  type WorkspaceHeaderStatus,
} from "@/components/layout/workspace-header";
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

function projectStatusTone(
  status: Project["status"],
): WorkspaceHeaderStatus["tone"] {
  switch (status) {
    case "active":
      return "success";
    case "draft":
      return "info";
    case "archived":
      return "default";
    default:
      return "default";
  }
}

function lifecycleLabel(project: Project) {
  const parts = [statusLabel(project.status)];
  if (project.project_type) {
    parts.push(project.project_type);
  }
  return parts.join(" · ");
}

export function ProjectWorkspaceHeader({
  workspaceId,
  companyId,
  project,
  canWriteProject,
}: ProjectWorkspaceHeaderProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const actions = useMemo((): WorkspaceHeaderAction[] => {
    if (!canWriteProject) return [];

    const next: WorkspaceHeaderAction[] = [];

    if (project.status !== "archived") {
      next.push({
        key: "edit",
        label: "Edit",
        href: `/dashboard/projects/${project.id}/edit`,
        disabled: pending,
      });
    }

    if (project.status === "draft") {
      next.push({
        key: "activate",
        label: "Activate",
        disabled: pending,
        onClick: () => {
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
        },
      });
    }

    if (project.status === "active") {
      next.push({
        key: "archive",
        label: "Archive",
        disabled: pending,
        onClick: () => {
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
        },
      });
    }

    if (project.status === "archived") {
      next.push({
        key: "restore",
        label: "Restore",
        disabled: pending,
        onClick: () => {
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
        },
      });
    }

    return next;
  }, [
    canWriteProject,
    companyId,
    pending,
    project.id,
    project.status,
    router,
    startTransition,
    workspaceId,
  ]);

  return (
    <WorkspaceHeader
      eyebrow="Project Workspace"
      title={project.name}
      status={{
        label: statusLabel(project.status),
        tone: projectStatusTone(project.status),
      }}
      lifecycle={lifecycleLabel(project)}
      breadcrumbs={[
        { label: "Projects", href: "/dashboard/projects" },
        { label: project.name },
      ]}
      actions={actions}
    />
  );
}
