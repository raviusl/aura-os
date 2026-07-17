import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireDashboardContext } from "@/core/auth/context";
import { getClientById } from "@/core/client/client";
import { listProjectsByCompany } from "@/core/project/project";
import { EditClientForm } from "@/features/client/components/edit-client-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditClientPage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireDashboardContext();

  if (!context.permissions.has("client.write")) {
    redirect("/dashboard/clients");
  }

  let client;
  try {
    client = await getClientById(id, context.workspace.id);
  } catch {
    notFound();
  }

  if (client.company_id !== context.company.id) {
    notFound();
  }

  const projects = await listProjectsByCompany(
    context.workspace.id,
    context.company.id,
  );

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href="/dashboard/clients"
          className="text-xs text-white/40 hover:text-white/70"
        >
          ← Clients
        </Link>
        <h1 className="mt-3 text-xl text-white">Edit client</h1>
        <p className="mt-2 text-sm text-white/45">{client.name}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <EditClientForm client={client} projects={projects} />
      </div>
    </div>
  );
}
