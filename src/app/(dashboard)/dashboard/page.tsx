import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listProjectsByCompany } from "@/core/project/project";
import { getDashboardData } from "@/features/dashboard/api/get-dashboard-data";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RevenueCards } from "@/features/dashboard/components/revenue-cards";
import { TaskCard } from "@/features/dashboard/components/task-card";
import { WeddingCard } from "@/features/dashboard/components/wedding-card";
import { ContextBanner } from "@/features/context/components/context-banner";
import { ClientsPanel } from "@/features/client/components/clients-panel";
import { ProjectsPanel } from "@/features/project/components/projects-panel";

export default async function DashboardPage() {
  const context = await requireDashboardContext();
  const [data, projects, clients] = await Promise.all([
    getDashboardData(),
    listProjectsByCompany(context.workspace.id, context.company.id),
    listClientsByCompany(context.workspace.id, context.company.id),
  ]);

  const canWriteProjects = context.permissions.has("project.write");
  const canWriteClients = context.permissions.has("client.write");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <ContextBanner context={context} />

      <div className="grid gap-6 xl:grid-cols-2">
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

      <DashboardHeader
        displayName={data.displayName}
        meetings={data.todaysMeetingsCount}
        weddings={data.todaysWeddingsCount}
        followUps={data.followUpClientsCount}
        tasks={data.todaysTasksCount}
      />

      <QuickActions />

      <RevenueCards
        monthlyRevenue={data.monthlyRevenue}
        monthlyProfit={data.monthlyProfit}
        outstandingPayments={data.outstandingPayments}
        currency={context.workspace.currency || data.currency}
        hasRecords={data.hasFinancialRecords}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <WeddingCard weddings={data.upcomingWeddings} />
        <TaskCard tasks={data.todaysTasks} />
      </div>
    </div>
  );
}
