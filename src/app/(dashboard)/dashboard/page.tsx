import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listProjectsByCompany } from "@/core/project/project";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { ContextBanner } from "@/features/context/components/context-banner";
import { ClientsPanel } from "@/features/client/components/clients-panel";
import { MvpOverview } from "@/features/dashboard/components/mvp-overview";
import { ProjectsPanel } from "@/features/project/components/projects-panel";
import { VendorsPanel } from "@/features/vendor/components/vendors-panel";

export default async function DashboardPage() {
  const context = await requireDashboardContext();
  const [projects, clients, vendors] = await Promise.all([
    listProjectsByCompany(context.workspace.id, context.company.id),
    listClientsByCompany(context.workspace.id, context.company.id),
    listVendorsByCompany(context.workspace.id, context.company.id),
  ]);

  const canWriteProjects = context.permissions.has("project.write");
  const canWriteClients = context.permissions.has("client.write");
  const canWriteVendors = context.permissions.has("vendor.write");

  const activeProjects = projects.filter((row) => row.status !== "archived");
  const activeClients = clients.filter((row) => row.status !== "archived");
  const activeVendors = vendors.filter((row) => row.status !== "archived");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <ContextBanner context={context} />

      <MvpOverview
        workspaceName={context.workspace.name}
        companyName={context.company.name}
        stats={[
          {
            label: "Projects",
            value: activeProjects.length,
            href: "/dashboard/projects",
          },
          {
            label: "Clients",
            value: activeClients.length,
            href: "/dashboard/clients",
          },
          {
            label: "Vendors",
            value: activeVendors.length,
            href: "/dashboard/vendors",
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ProjectsPanel
          projects={projects}
          companyName={context.company.name}
          canWrite={canWriteProjects}
        />
        <ClientsPanel
          clients={clients}
          companyName={context.company.name}
          canWrite={canWriteClients}
        />
      </div>

      <VendorsPanel
        vendors={vendors}
        companyName={context.company.name}
        canWrite={canWriteVendors}
      />
    </div>
  );
}
