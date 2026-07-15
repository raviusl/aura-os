import { Bilingual } from "@/components/ui/bilingual";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { copy } from "@/config/i18n";
import type { TaskPriority, Tables } from "@/types/database";

const priorityLabel: Record<TaskPriority, { zh: string; en: string }> = {
  low: { zh: "低", en: "Low" },
  medium: { zh: "中", en: "Medium" },
  high: { zh: "高", en: "High" },
  urgent: { zh: "紧急", en: "Urgent" },
};

type TaskRow = Tables<"tasks"> & {
  owner: Pick<Tables<"profiles">, "id" | "display_name" | "full_name"> | null;
};

type TaskCardProps = {
  tasks: TaskRow[];
};

function formatDue(dueAt: string | null) {
  if (!dueAt) return "—";
  return new Intl.DateTimeFormat("zh-HK", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dueAt));
}

export function TaskCard({ tasks }: TaskCardProps) {
  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
      <Bilingual
        text={copy.todaysTasks}
        zhClassName="text-sm text-white/85"
        enClassName="text-white/35"
      />

      {tasks.length === 0 ? (
        <div className="mt-4">
          <EmptyState />
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.05]">
          <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr] gap-2 border-b border-white/[0.05] bg-white/[0.03] px-3 py-2 text-[11px] text-white/40">
            <span>任务 · Task</span>
            <span>
              {copy.priority.zh} · {copy.priority.en}
            </span>
            <span>
              {copy.dueTime.zh} · {copy.dueTime.en}
            </span>
            <span>
              {copy.owner.zh} · {copy.owner.en}
            </span>
          </div>
          <ul className="divide-y divide-white/[0.05]">
            {tasks.map((task) => {
              const priority = priorityLabel[task.priority];
              const ownerName =
                task.owner?.display_name ||
                task.owner?.full_name ||
                "—";
              return (
                <li
                  key={task.id}
                  className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.9fr] items-center gap-2 px-3 py-3 text-sm"
                >
                  <span className="truncate font-medium text-white/90">
                    {task.title}
                  </span>
                  <Badge
                    variant="secondary"
                    className="w-fit border-white/10 bg-white/[0.06] text-[11px] text-white/75"
                  >
                    {priority.zh} · {priority.en}
                  </Badge>
                  <span className="tabular-nums text-white/60">
                    {formatDue(task.due_at)}
                  </span>
                  <span className="truncate text-white/55">{ownerName}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
