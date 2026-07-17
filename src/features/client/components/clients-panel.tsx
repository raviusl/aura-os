import Link from "next/link";

import type { Client } from "@/core/types";

type ClientsPanelProps = {
  clients: Client[];
  companyName: string;
  canWrite: boolean;
};

function typeLabel(type: Client["client_type"]) {
  if (!type) return "Unspecified";
  if (type === "corporate") return "Corporate Client";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function statusLabel(status: Client["status"]) {
  if (status === "follow_up") return "Follow-up";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function ClientsPanel({
  clients,
  companyName,
  canWrite,
}: ClientsPanelProps) {
  const visible = clients.filter((client) => client.status !== "archived");

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-white">Clients</h2>
          <p className="mt-1 text-xs text-white/45">
            Active company: {companyName}
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/clients/new"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            New client
          </Link>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-6 text-sm text-white/45">
          No clients in this company yet.
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {visible.slice(0, 6).map((client) => (
            <li
              key={client.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{client.name}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {typeLabel(client.client_type)} · {statusLabel(client.status)}
                    {client.email ? ` · ${client.email}` : ""}
                  </p>
                </div>
                <Link
                  href="/dashboard/clients"
                  className="shrink-0 text-xs text-white/45 hover:text-white/70"
                >
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {clients.length > 0 ? (
        <div className="mt-3">
          <Link
            href="/dashboard/clients"
            className="text-xs text-white/45 hover:text-white/70"
          >
            {clients.length > 6
              ? `View all ${clients.length} clients →`
              : "Manage clients →"}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
