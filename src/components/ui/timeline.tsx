"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type TimelineItem = {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  time?: React.ReactNode;
  status?: "default" | "active" | "done" | "muted";
};

type TimelineProps = React.ComponentProps<"ol"> & {
  items: TimelineItem[];
};

const statusDot: Record<NonNullable<TimelineItem["status"]>, string> = {
  default: "border-border bg-background",
  active: "border-primary bg-primary",
  done: "border-success bg-success",
  muted: "border-border bg-muted",
};

function Timeline({ className, items, ...props }: TimelineProps) {
  return (
    <ol
      data-slot="timeline"
      className={cn("relative flex flex-col gap-0", className)}
      {...props}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const status = item.status ?? "default";

        return (
          <li
            key={item.id}
            data-slot="timeline-item"
            className="relative flex gap-3 pb-6 last:pb-0"
          >
            {!isLast ? (
              <span
                className="absolute top-3 left-[7px] h-[calc(100%-4px)] w-px bg-border"
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 mt-1 size-3.5 shrink-0 rounded-full border-2",
                statusDot[status],
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                {item.time ? (
                  <time className="text-xs text-muted-foreground">{item.time}</time>
                ) : null}
              </div>
              {item.description ? (
                <div className="text-sm text-muted-foreground">{item.description}</div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export { Timeline };
export type { TimelineProps, TimelineItem };
