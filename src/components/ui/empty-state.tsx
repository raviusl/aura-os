import { cn } from "@/lib/utils";
import { Bilingual } from "@/components/ui/bilingual";
import { copy } from "@/config/i18n";

type EmptyStateProps = {
  className?: string;
  title?: { zh: string; en: string };
  description?: { zh: string; en: string };
};

export function EmptyState({
  className,
  title = copy.emptyTitle,
  description = copy.emptyDescription,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center",
        className,
      )}
    >
      <Bilingual
        text={title}
        className="items-center"
        zhClassName="text-sm text-foreground/90"
        enClassName="text-muted-foreground"
      />
      <Bilingual
        text={description}
        className="mt-2 max-w-xs items-center"
        zhClassName="text-xs font-normal text-muted-foreground"
        enClassName="text-[11px] text-muted-foreground/80"
      />
    </div>
  );
}
