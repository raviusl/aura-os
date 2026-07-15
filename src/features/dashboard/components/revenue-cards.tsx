import { Bilingual } from "@/components/ui/bilingual";
import { EmptyState } from "@/components/ui/empty-state";
import { copy } from "@/config/i18n";

type RevenueCardsProps = {
  monthlyRevenue: number;
  monthlyProfit: number;
  outstandingPayments: number;
  currency: string;
  hasRecords: boolean;
};

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("zh-HK", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function MetricCard({
  label,
  value,
}: {
  label: { zh: string; en: string };
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.05] to-transparent p-5">
      <Bilingual
        text={label}
        compact
        zhClassName="text-white/70"
        enClassName="text-white/35"
      />
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white tabular-nums">
        {value}
      </p>
    </div>
  );
}

export function RevenueCards({
  monthlyRevenue,
  monthlyProfit,
  outstandingPayments,
  currency,
  hasRecords,
}: RevenueCardsProps) {
  if (!hasRecords) {
    return (
      <section className="space-y-3">
        <Bilingual text={copy.monthlyRevenue} zhClassName="text-sm text-white/80" />
        <EmptyState />
      </section>
    );
  }

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <MetricCard
        label={copy.monthlyRevenue}
        value={formatMoney(monthlyRevenue, currency)}
      />
      <MetricCard
        label={copy.monthlyProfit}
        value={formatMoney(monthlyProfit, currency)}
      />
      <MetricCard
        label={copy.outstandingPayments}
        value={formatMoney(outstandingPayments, currency)}
      />
    </section>
  );
}
