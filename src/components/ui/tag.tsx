"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const tagVariants = cva(
  "inline-flex h-6 max-w-full items-center gap-1 rounded-md border px-2 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-transparent text-foreground",
        muted: "border-transparent bg-muted text-muted-foreground",
        accent: "border-transparent bg-accent text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type TagProps = React.ComponentProps<"span"> &
  VariantProps<typeof tagVariants> & {
    onRemove?: () => void;
  };

function Tag({ className, variant, children, onRemove, ...props }: TagProps) {
  return (
    <span
      data-slot="tag"
      className={cn(tagVariants({ variant }), className)}
      {...props}
    >
      <span className="truncate">{children}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Remove"
        >
          <XIcon className="size-3" />
        </button>
      ) : null}
    </span>
  );
}

export { Tag, tagVariants };
export type { TagProps };
