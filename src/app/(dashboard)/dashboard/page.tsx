import { requireDashboardContext } from "@/core/auth/context";
import { getDashboardData } from "@/features/dashboard/api/get-dashboard-data";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { QuickActions } from "@/features/dashboard/components/quick-actions";
import { RevenueCards } from "@/features/dashboard/components/revenue-cards";
import { TaskCard } from "@/features/dashboard/components/task-card";
import { WeddingCard } from "@/features/dashboard/components/wedding-card";
import { ContextBanner } from "@/features/context/components/context-banner";

export default async function DashboardPage() {
  const context = await requireDashboardContext();
  const data = await getDashboardData();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <ContextBanner context={context} />

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
