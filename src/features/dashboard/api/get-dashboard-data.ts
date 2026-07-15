import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

function startOfDayISO(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function endOfDayISO(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

function todayDateString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function monthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export type DashboardData = {
  profile: Tables<"profiles"> | null;
  displayName: string;
  todaysMeetingsCount: number;
  todaysWeddingsCount: number;
  followUpClientsCount: number;
  todaysTasksCount: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  outstandingPayments: number;
  hasFinancialRecords: boolean;
  upcomingWeddings: Tables<"weddings">[];
  todaysTasks: Array<
    Tables<"tasks"> & {
      owner: Pick<Tables<"profiles">, "id" | "display_name" | "full_name"> | null;
    }
  >;
  currency: string;
};

const emptyDashboard = (displayName = "—"): DashboardData => ({
  profile: null,
  displayName,
  todaysMeetingsCount: 0,
  todaysWeddingsCount: 0,
  followUpClientsCount: 0,
  todaysTasksCount: 0,
  monthlyRevenue: 0,
  monthlyProfit: 0,
  outstandingPayments: 0,
  hasFinancialRecords: false,
  upcomingWeddings: [],
  todaysTasks: [],
  currency: "HKD",
});

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return emptyDashboard();
  }

  const fallbackName =
    user.user_metadata?.display_name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "—";

  const dayStart = startOfDayISO();
  const dayEnd = endOfDayISO();
  const today = todayDateString();
  const { start: monthStart, end: monthEnd } = monthBounds();

  try {
    const [
      profileRes,
      meetingsRes,
      weddingsTodayRes,
      followUpsRes,
      tasksTodayCountRes,
      revenueRes,
      expenseRes,
      outstandingRes,
      financialCountRes,
      upcomingWeddingsRes,
      todaysTasksRes,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("meetings")
        .select("id", { count: "exact", head: true })
        .gte("starts_at", dayStart)
        .lte("starts_at", dayEnd),
      supabase
        .from("weddings")
        .select("id", { count: "exact", head: true })
        .eq("wedding_date", today)
        .neq("status", "cancelled"),
      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("status", "follow_up"),
      supabase
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .gte("due_at", dayStart)
        .lte("due_at", dayEnd)
        .neq("status", "cancelled"),
      supabase
        .from("financial_records")
        .select("amount, currency")
        .eq("record_type", "revenue")
        .neq("status", "cancelled")
        .gte("occurred_on", monthStart)
        .lte("occurred_on", monthEnd),
      supabase
        .from("financial_records")
        .select("amount")
        .eq("record_type", "expense")
        .neq("status", "cancelled")
        .gte("occurred_on", monthStart)
        .lte("occurred_on", monthEnd),
      supabase
        .from("financial_records")
        .select("amount, currency")
        .eq("status", "outstanding"),
      supabase
        .from("financial_records")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("weddings")
        .select("*")
        .gte("wedding_date", today)
        .neq("status", "cancelled")
        .order("wedding_date", { ascending: true })
        .limit(5),
      supabase
        .from("tasks")
        .select("*")
        .gte("due_at", dayStart)
        .lte("due_at", dayEnd)
        .neq("status", "cancelled")
        .order("due_at", { ascending: true })
        .limit(8),
    ]);

    // Missing relation errors (Postgres 42P01 or PostgREST PGRST205)
    // keep the Command Center usable with empty states.
    const relationMissing = [
      profileRes.error,
      meetingsRes.error,
      weddingsTodayRes.error,
      followUpsRes.error,
      tasksTodayCountRes.error,
      revenueRes.error,
      outstandingRes.error,
      upcomingWeddingsRes.error,
      todaysTasksRes.error,
    ].some(
      (error) =>
        error?.code === "42P01" ||
        error?.code === "PGRST205" ||
        error?.code === "42703" ||
        error?.message?.toLowerCase().includes("does not exist") ||
        error?.message?.toLowerCase().includes("could not find the table"),
    );

    if (relationMissing) {
      return emptyDashboard(fallbackName);
    }

    const monthlyRevenue = (revenueRes.data ?? []).reduce(
      (sum, row) => sum + Number(row.amount ?? 0),
      0,
    );
    const monthlyExpense = (expenseRes.data ?? []).reduce(
      (sum, row) => sum + Number(row.amount ?? 0),
      0,
    );
    const outstandingPayments = (outstandingRes.data ?? []).reduce(
      (sum, row) => sum + Number(row.amount ?? 0),
      0,
    );

    const currency =
      revenueRes.data?.[0]?.currency ??
      outstandingRes.data?.[0]?.currency ??
      "HKD";

    const tasks = todaysTasksRes.data ?? [];
    const ownerIds = [
      ...new Set(tasks.map((t) => t.owner_id).filter(Boolean)),
    ] as string[];

    let ownersById: Record<
      string,
      Pick<Tables<"profiles">, "id" | "display_name" | "full_name">
    > = {};

    if (ownerIds.length > 0) {
      const { data: owners } = await supabase
        .from("profiles")
        .select("id, display_name, full_name")
        .in("id", ownerIds);
      ownersById = Object.fromEntries((owners ?? []).map((o) => [o.id, o]));
    }

    const displayName =
      profileRes.data?.display_name ||
      profileRes.data?.full_name ||
      fallbackName;

    return {
      profile: profileRes.data,
      displayName,
      todaysMeetingsCount: meetingsRes.count ?? 0,
      todaysWeddingsCount: weddingsTodayRes.count ?? 0,
      followUpClientsCount: followUpsRes.count ?? 0,
      todaysTasksCount: tasksTodayCountRes.count ?? 0,
      monthlyRevenue,
      monthlyProfit: monthlyRevenue - monthlyExpense,
      outstandingPayments,
      hasFinancialRecords: (financialCountRes.count ?? 0) > 0,
      upcomingWeddings: upcomingWeddingsRes.data ?? [],
      todaysTasks: tasks.map((task) => ({
        ...task,
        owner: task.owner_id ? (ownersById[task.owner_id] ?? null) : null,
      })),
      currency,
    };
  } catch {
    return emptyDashboard(fallbackName);
  }
}
