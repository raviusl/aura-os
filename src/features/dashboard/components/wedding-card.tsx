import { AppEmptyState } from "@/components/layout/app-empty-state";
import { Bilingual } from "@/components/ui/bilingual";
import { Badge } from "@/components/ui/badge";
import { copy } from "@/config/i18n";
import type { Tables, WeddingStatus } from "@/types/database";

const statusLabel: Record<WeddingStatus, { zh: string; en: string }> = {
  inquiry: { zh: "询价", en: "Inquiry" },
  confirmed: { zh: "已确认", en: "Confirmed" },
  in_progress: { zh: "进行中", en: "In Progress" },
  completed: { zh: "已完成", en: "Completed" },
  cancelled: { zh: "已取消", en: "Cancelled" },
};

type WeddingCardProps = {
  weddings: Tables<"weddings">[];
};

export function WeddingCard({ weddings }: WeddingCardProps) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <Bilingual
        text={copy.upcomingWeddings}
        zhClassName="text-sm text-white/85"
        enClassName="text-white/35"
      />

      {weddings.length === 0 ? (
        <div className="mt-4">
          <AppEmptyState />
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.05]">
          <div className="grid grid-cols-[1.4fr_0.9fr_1fr_0.8fr] gap-2 border-b border-white/[0.05] bg-white/[0.03] px-3 py-2 text-[11px] text-white/40">
            <span>
              {copy.weddingName.zh}
              <span className="ml-1 text-white/25">{copy.weddingName.en}</span>
            </span>
            <span>
              {copy.date.zh}
              <span className="ml-1 text-white/25">{copy.date.en}</span>
            </span>
            <span>
              {copy.venue.zh}
              <span className="ml-1 text-white/25">{copy.venue.en}</span>
            </span>
            <span>
              {copy.status.zh}
              <span className="ml-1 text-white/25">{copy.status.en}</span>
            </span>
          </div>
          <ul className="divide-y divide-white/[0.05]">
            {weddings.map((wedding) => {
              const status = statusLabel[wedding.status];
              return (
                <li
                  key={wedding.id}
                  className="grid grid-cols-[1.4fr_0.9fr_1fr_0.8fr] items-center gap-2 px-3 py-3 text-sm"
                >
                  <span className="truncate font-medium text-white/90">
                    {wedding.name}
                  </span>
                  <span className="tabular-nums text-white/60">
                    {wedding.wedding_date}
                  </span>
                  <span className="truncate text-white/55">
                    {wedding.venue ?? "—"}
                  </span>
                  <Badge
                    variant="secondary"
                    className="w-fit border-white/10 bg-white/[0.06] text-[11px] text-white/75"
                  >
                    {status.zh} · {status.en}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
