import Link from "next/link";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { requireDashboardContext } from "@/core/auth/context";
import { listProjectsByCompany } from "@/core/project/project";
import { ProjectListItem } from "@/features/project/components/project-list-item";

export default async function ProjectsPage() {
  const context = await requireDashboardContext();
  const projects = await listProjectsByCompany(
    context.workspace.id,
    context.company.id,
  );
  const canWrite = context.permissions.has("project.write");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl text-white">Projects</h1>
          <p className="mt-2 text-sm text-white/45">
            Projects in{" "}
            <span className="text-white/70">{context.company.name}</span>
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/projects/new"
            className="inline-flex w-fit rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            Create
          </Link>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <ModuleEmptyState
          title="No projects yet"
          description="Create your first project to organize work for this company."
          actionHref={canWrite ? "/dashboard/projects/new" : undefined}
          actionLabel={canWrite ? "Create project" : undefined}
        />
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li key={project.id}>
              <ProjectListItem
                workspaceId={context.workspace.id}
                companyId={context.company.id}
                project={project}
                canWrite={canWrite}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
