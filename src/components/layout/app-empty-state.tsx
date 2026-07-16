import { Bilingual } from "@/components/ui/bilingual";
import { EmptyState, type EmptyStateProps } from "@/components/ui/empty-state";
import { copy } from "@/config/i18n";

type AppEmptyStateProps = EmptyStateProps;

/**
 * App-level empty state with bilingual defaults.
 * Keeps design-system EmptyState free of i18n coupling.
 */
export function AppEmptyState({
  title,
  description,
  ...props
}: AppEmptyStateProps) {
  return (
    <EmptyState
      {...props}
      title={
        title ?? (
          <Bilingual
            text={copy.emptyTitle}
            className="items-center"
            zhClassName="text-sm text-foreground/90"
            enClassName="text-muted-foreground"
          />
        )
      }
      description={
        description ?? (
          <Bilingual
            text={copy.emptyDescription}
            className="items-center"
            zhClassName="text-xs font-normal text-muted-foreground"
            enClassName="text-[11px] text-muted-foreground/80"
          />
        )
      }
    />
  );
}
