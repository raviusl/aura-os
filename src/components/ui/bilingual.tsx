import { cn } from "@/lib/utils";
import type { BilingualText } from "@/config/i18n";

type BilingualProps = {
  text: BilingualText;
  className?: string;
  zhClassName?: string;
  enClassName?: string;
  compact?: boolean;
};

export function Bilingual({
  text,
  className,
  zhClassName,
  enClassName,
  compact = false,
}: BilingualProps) {
  return (
    <span className={cn("flex flex-col", className)}>
      <span className={cn(compact ? "text-sm font-medium" : "font-medium", zhClassName)}>
        {text.zh}
      </span>
      <span
        className={cn(
          "text-muted-foreground",
          compact ? "text-[11px] leading-tight" : "text-xs",
          enClassName,
        )}
      >
        {text.en}
      </span>
    </span>
  );
}
