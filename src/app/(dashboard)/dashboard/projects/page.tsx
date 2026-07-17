import Link from "next/link";

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
      <div className="flex items-start justify-between gap-4">
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
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            Create
          </Link>
        ) : null}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-sm text-white/45">
          No projects in this company yet.
          {canWrite ? " Create one to get started." : ""}
        </div>
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
