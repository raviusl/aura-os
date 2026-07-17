import Link from "next/link";
import { redirect } from "next/navigation";

import { requireDashboardContext } from "@/core/auth/context";
import { listProjectsByCompany } from "@/core/project/project";
import { CreateClientForm } from "@/features/client/components/create-client-form";

export default async function NewClientPage() {
  const context = await requireDashboardContext();

  if (!context.permissions.has("client.write")) {
    redirect("/dashboard/clients");
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
        <h1 className="mt-3 text-xl text-white">Create client</h1>
        <p className="mt-2 text-sm text-white/45">
          Add a client to{" "}
          <span className="text-white/70">{context.company.name}</span>.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <CreateClientForm
          workspaceId={context.workspace.id}
          companyId={context.company.id}
          projects={projects}
        />
      </div>
    </div>
  );
}
