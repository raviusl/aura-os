"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { Button } from "@/components/ui/button";
import type { Client, Project } from "@/core/types";

type ProjectWorkspaceClientsPanelProps = {
  project: Project;
  clients: Client[];
  canWriteClient: boolean;
  canReadClient: boolean;
};

function statusLabel(status: string) {
  if (status === "follow_up") return "Follow-up";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function clientTypeLabel(type: Client["client_type"]) {
  if (!type) return "Unspecified";
  if (type === "corporate") return "Corporate Client";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function ProjectWorkspaceClientsPanel({
  project,
  clients,
  canWriteClient,
  canReadClient,
}: ProjectWorkspaceClientsPanelProps) {
  const router = useRouter();

  if (!canReadClient) {
    return (
      <ModuleEmptyState
        title="Clients unavailable"
        description="You do not have permission to view clients for this project."
      />
    );
  }

  const visibleClients = clients.filter((client) => client.status !== "archived");

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-white">
            Linked clients ({visibleClients.length})
          </h2>
          <p className="mt-1 text-xs text-white/45">
            Clients attached to this project
          </p>
        </div>
        {canWriteClient && project.status !== "archived" ? (
          <Link
            href={`/dashboard/clients/new?projectId=${project.id}`}
            className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            Add client
          </Link>
        ) : null}
      </div>

      {visibleClients.length === 0 ? (
        <ModuleEmptyState
          title="No clients linked"
          description="Link a client to this project to keep delivery contacts in one place."
          actionHref={
            canWriteClient && project.status !== "archived"
              ? `/dashboard/clients/new?projectId=${project.id}`
              : undefined
          }
          actionLabel={canWriteClient ? "Add client" : undefined}
        />
      ) : (
        <ul className="space-y-3">
          {visibleClients.map((client) => (
            <li
              key={client.id}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {client.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-white/45">
                    {clientTypeLabel(client.client_type)} ·{" "}
                    {statusLabel(client.status)}
                    {client.email ? ` · ${client.email}` : ""}
                  </p>
                </div>
                {canWriteClient && client.status !== "archived" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/clients/${client.id}/edit`)
                    }
                  >
                    Edit
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
