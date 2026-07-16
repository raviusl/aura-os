import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
};

/**
 * Presentational empty state. Keep copy/i18n at the call site (or use AppEmptyState).
 */
function EmptyState({
  className,
  title = "Nothing here yet",
  description = "Add an item to get started.",
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

      {typeof title === "string" ? (
        <p className="text-sm font-medium text-foreground">{title}</p>
      ) : (
        title
      )}

      {description ? (
        typeof description === "string" ? (
          <p className="mt-2 max-w-sm text-xs text-muted-foreground">
            {description}
          </p>
        ) : (
          <div className="mt-2 max-w-sm">{description}</div>
        )
      ) : null}

      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export { EmptyState };
export type { EmptyStateProps };
