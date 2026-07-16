import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex h-5 items-center gap-1.5 rounded-full border px-2 text-[11px] font-medium tracking-wide whitespace-nowrap",
  {
    variants: {
      status: {
        default: "border-border bg-muted text-muted-foreground",
        success: "border-success/20 bg-success/10 text-success",
        warning: "border-warning/20 bg-warning/10 text-warning",
        danger: "border-destructive/20 bg-destructive/10 text-destructive",
        info: "border-info/20 bg-info/10 text-info",
      },
    },
    defaultVariants: {
      status: "default",
    },
  },
);

const statusDotClass = {
  default: "bg-muted-foreground",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  info: "bg-info",
} as const;

type StatusBadgeProps = ComponentProps<"span"> &
  VariantProps<typeof statusBadgeVariants> & {
    label?: string;
    showDot?: boolean;
  };

function StatusBadge({
  className,
  status = "default",
  showDot = true,
  label,
  children,
  ...props
}: StatusBadgeProps) {
  const resolved = status ?? "default";

  return (
    <span
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ status: resolved }), className)}
      {...props}
    >
      {showDot ? (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", statusDotClass[resolved])}
          aria-hidden
        />
      ) : null}
      {label ?? children}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants };
export type { StatusBadgeProps };
