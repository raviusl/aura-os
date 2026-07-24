import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByProject } from "@/core/client/client";
import { getProjectById } from "@/core/project/project";
import { listVendorsByProject } from "@/core/vendor/vendor";
import { ProjectWorkspace } from "@/features/project/components/project-workspace";
import { parseProjectWorkspaceTab } from "@/features/project/lib/project-workspace-tabs";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function ProjectWorkspacePage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const context = await requireDashboardContext();

  if (!context.permissions.has("project.read")) {
    notFound();
  }

  let project;
  try {
    project = await getProjectById(id, context.workspace.id);
  } catch {
    notFound();
  }

  if (project.company_id !== context.company.id) {
    notFound();
  }

  const canReadClient = context.permissions.has("client.read");
  const canReadVendor = context.permissions.has("vendor.read");
  const initialTab = parseProjectWorkspaceTab(query.tab);

  const [clients, vendors] = await Promise.all([
    canReadClient
      ? listClientsByProject(
          context.workspace.id,
          context.company.id,
          project.id,
        )
      : Promise.resolve([]),
    canReadVendor
      ? listVendorsByProject(
          context.workspace.id,
          context.company.id,
          project.id,
        )
      : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <Link
          href="/dashboard/projects"
          className="text-xs text-white/40 hover:text-white/70"
        >
          ← Projects
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-10 text-sm text-white/45">
            Loading workspace…
          </div>
        }
      >
        <ProjectWorkspace
          workspaceId={context.workspace.id}
          companyId={context.company.id}
          project={project}
          clients={clients}
          vendors={vendors}
          canWriteProject={context.permissions.has("project.write")}
          canWriteClient={context.permissions.has("client.write")}
          canWriteVendor={context.permissions.has("vendor.write")}
          canReadClient={canReadClient}
          canReadVendor={canReadVendor}
          initialTab={initialTab}
        />
      </Suspense>
    </div>
  );
}
