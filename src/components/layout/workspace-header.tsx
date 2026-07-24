import Link from "next/link";
import type { ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export type WorkspaceHeaderBreadcrumb = {
  label: string;
  href?: string;
};

export type WorkspaceHeaderStatus = {
  label: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
};

export type WorkspaceHeaderAction = {
  key: string;
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
};

export type WorkspaceHeaderProps = {
  /** Primary entity name */
  title: string;
  /** Small label above the title (e.g. "Project Workspace") */
  eyebrow?: string;
  /** Current status badge */
  status?: WorkspaceHeaderStatus;
  /** Lifecycle stage / type line (e.g. "Active · wedding") */
  lifecycle?: string;
  /** Navigation trail */
  breadcrumbs?: WorkspaceHeaderBreadcrumb[];
  /** Primary action buttons */
  actions?: WorkspaceHeaderAction[];
  /** Optional trailing slot (custom controls) */
  trailing?: ReactNode;
  className?: string;
};

/**
 * Shared header chrome for Project / Client / Vendor (and future) workspace pages.
 * Presentational only — domain actions are passed in via props.
 */
export function WorkspaceHeader({
  title,
  eyebrow,
  status,
  lifecycle,
  breadcrumbs,
  actions,
  trailing,
  className,
}: WorkspaceHeaderProps) {
  const hasActions = (actions && actions.length > 0) || trailing;

  return (
    <section
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5",
        className,
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <Breadcrumb className="mb-4">
          <BreadcrumbList className="gap-1 text-xs text-white/40">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span key={`${item.label}-${index}`} className="contents">
                  {index > 0 ? (
                    <BreadcrumbSeparator className="mx-0.5 text-white/25 [&>svg]:size-3" />
                  ) : null}
                  <BreadcrumbItem>
                    {isLast || !item.href ? (
                      <BreadcrumbPage className="truncate text-white/55">
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        render={<Link href={item.href} />}
                        className="truncate text-white/40 transition-colors hover:text-white/70"
                      >
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow ? (
            <p className="text-xs text-white/40">{eyebrow}</p>
          ) : null}

          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <h1 className="truncate text-xl text-white">{title}</h1>
            {status ? (
              <StatusBadge
                status={status.tone ?? "default"}
                label={status.label}
                className="border-white/10 bg-white/[0.06] text-white/70"
              />
            ) : null}
          </div>

          {lifecycle ? (
            <p className="text-sm text-white/45">{lifecycle}</p>
          ) : null}
        </div>

        {hasActions ? (
          <div className="flex flex-wrap gap-2">
            {actions?.map((action) => {
              const variant = action.variant ?? "outline";
              if (action.href) {
                return (
                  <Link
                    key={action.key}
                    href={action.href}
                    aria-disabled={action.disabled || undefined}
                    className={cn(
                      buttonVariants({ variant, size: "sm" }),
                      action.disabled && "pointer-events-none opacity-50",
                    )}
                    onClick={
                      action.disabled
                        ? (event) => event.preventDefault()
                        : undefined
                    }
                  >
                    {action.label}
                  </Link>
                );
              }

              return (
                <Button
                  key={action.key}
                  type="button"
                  size="sm"
                  variant={variant}
                  disabled={action.disabled}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              );
            })}
            {trailing}
          </div>
        ) : null}
      </div>
    </section>
  );
}
