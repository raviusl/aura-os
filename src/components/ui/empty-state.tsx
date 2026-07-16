import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Bilingual } from "@/components/ui/bilingual";
import { copy } from "@/config/i18n";

type BilingualText = { zh: string; en: string };

type EmptyStateProps = {
  className?: string;
  title?: string | BilingualText;
  description?: string | BilingualText;
  icon?: ReactNode;
  action?: ReactNode;
};

function isBilingual(value: string | BilingualText): value is BilingualText {
  return typeof value === "object" && value !== null && "zh" in value && "en" in value;
}

export function EmptyState({
  className,
  title = copy.emptyTitle,
  description = copy.emptyDescription,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      ) : null}

      {isBilingual(title) ? (
        <Bilingual
          text={title}
          className="items-center"
          zhClassName="text-sm text-foreground/90"
          enClassName="text-muted-foreground"
        />
      ) : (
        <p className="text-sm font-medium text-foreground">{title}</p>
      )}

      {description ? (
        isBilingual(description) ? (
          <Bilingual
            text={description}
            className="mt-2 max-w-xs items-center"
            zhClassName="text-xs font-normal text-muted-foreground"
            enClassName="text-[11px] text-muted-foreground/80"
          />
        ) : (
          <p className="mt-2 max-w-sm text-xs text-muted-foreground">{description}</p>
        )
      ) : null}

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export type { EmptyStateProps };
