import Link from "next/link";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listProjectsByCompany } from "@/core/project/project";
import { ClientListItem } from "@/features/client/components/client-list-item";

export default async function ClientsPage() {
  const context = await requireDashboardContext();
  const [clients, projects] = await Promise.all([
    listClientsByCompany(context.workspace.id, context.company.id),
    listProjectsByCompany(context.workspace.id, context.company.id),
  ]);
  const canWrite = context.permissions.has("client.write");
  const projectNames = new Map(
    projects.map((project) => [project.id, project.name]),
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl text-white">Clients</h1>
          <p className="mt-2 text-sm text-white/45">
            Clients in{" "}
            <span className="text-white/70">{context.company.name}</span>
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/clients/new"
            className="inline-flex w-fit rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            Create
          </Link>
        ) : null}
      </div>

      {clients.length === 0 ? (
        <ModuleEmptyState
          title="No clients yet"
          description="Add Bride, Groom, Corporate, or Individual clients."
          actionHref={canWrite ? "/dashboard/clients/new" : undefined}
          actionLabel={canWrite ? "Create client" : undefined}
        />
      ) : (
        <ul className="space-y-3">
          {clients.map((client) => (
            <li key={client.id}>
              <ClientListItem
                workspaceId={context.workspace.id}
                companyId={context.company.id}
                client={client}
                canWrite={canWrite}
                projectName={
                  client.project_id
                    ? projectNames.get(client.project_id) ?? null
                    : null
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
