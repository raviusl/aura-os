"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const loadingVariants = cva("inline-flex items-center justify-center gap-2 text-muted-foreground", {
  variants: {
    size: {
      sm: "text-xs [&_svg]:size-3.5",
      default: "text-sm [&_svg]:size-4",
      lg: "text-base [&_svg]:size-5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type LoadingProps = React.ComponentProps<"div"> &
  VariantProps<typeof loadingVariants> & {
    label?: string;
    fullPage?: boolean;
  };

function Loading({
  className,
  size,
  label = "Loading",
  fullPage = false,
  ...props
}: LoadingProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-slot="loading"
      className={cn(
        loadingVariants({ size }),
        fullPage && "flex min-h-[40vh] w-full flex-col",
        className,
      )}
      {...props}
    >
      <Loader2Icon className="animate-spin" aria-hidden />
      <span>{label}</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export { Loading, loadingVariants };
export type { LoadingProps };
