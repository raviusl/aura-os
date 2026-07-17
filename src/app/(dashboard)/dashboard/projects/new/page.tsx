import Link from "next/link";
import { redirect } from "next/navigation";

import { requireDashboardContext } from "@/core/auth/context";
import { CreateProjectForm } from "@/features/project/components/create-project-form";

export default async function NewProjectPage() {
  const context = await requireDashboardContext();

  if (!context.permissions.has("project.write")) {
    redirect("/dashboard/projects");
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href="/dashboard/projects"
          className="text-xs text-white/40 hover:text-white/70"
        >
          ← Projects
        </Link>
        <h1 className="mt-3 text-xl text-white">Create project</h1>
        <p className="mt-2 text-sm text-white/45">
          Add a project to{" "}
          <span className="text-white/70">{context.company.name}</span>.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <CreateProjectForm
          workspaceId={context.workspace.id}
          companyId={context.company.id}
        />
      </div>
    </div>
  );
}
