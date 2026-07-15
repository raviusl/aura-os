import { Bilingual } from "@/components/ui/bilingual";
import { copy, getGreeting } from "@/config/i18n";

type DashboardHeaderProps = {
  displayName: string;
  meetings: number;
  weddings: number;
  followUps: number;
  tasks: number;
};

function StatCell({
  label,
  value,
}: {
  label: { zh: string; en: string };
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
      <Bilingual
        text={label}
        compact
        zhClassName="text-white/70"
        enClassName="text-white/35"
      />
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white tabular-nums">
        {value}
      </p>
    </div>
  );
}

export function DashboardHeader({
  displayName,
  meetings,
  weddings,
  followUps,
  tasks,
}: DashboardHeaderProps) {
  const greeting = getGreeting();

  return (
    <header className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          {greeting.zh}，{displayName} 👋
        </h1>
        <p className="mt-1 text-sm text-white/40">
          {greeting.en}, {displayName}
        </p>
      </div>

      <section className="space-y-3">
        <Bilingual
          text={copy.todayOverview}
          zhClassName="text-sm text-white/80"
          enClassName="text-white/35"
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCell label={copy.todaysMeetings} value={meetings} />
          <StatCell label={copy.todaysWeddings} value={weddings} />
          <StatCell label={copy.followUpClients} value={followUps} />
          <StatCell label={copy.todaysTasks} value={tasks} />
        </div>
      </section>
    </header>
  );
}
