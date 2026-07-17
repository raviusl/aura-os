import Link from "next/link";

import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { ClientListItem } from "@/features/client/components/client-list-item";

export default async function ClientsPage() {
  const context = await requireDashboardContext();
  const clients = await listClientsByCompany(
    context.workspace.id,
    context.company.id,
  );
  const canWrite = context.permissions.has("client.write");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex items-start justify-between gap-4">
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
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            Create
          </Link>
        ) : null}
      </div>

      {clients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-sm text-white/45">
          No clients in this company yet.
          {canWrite ? " Create one to get started." : ""}
        </div>
      ) : (
        <ul className="space-y-3">
          {clients.map((client) => (
            <li key={client.id}>
              <ClientListItem
                workspaceId={context.workspace.id}
                companyId={context.company.id}
                client={client}
                canWrite={canWrite}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
