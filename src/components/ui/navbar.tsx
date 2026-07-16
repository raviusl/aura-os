import * as React from "react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

type NavbarProps = React.ComponentProps<"header"> & {
  brand?: React.ReactNode;
  search?: React.ReactNode;
  actions?: React.ReactNode;
};

function Navbar({
  className,
  brand,
  search,
  actions,
  children,
  ...props
}: NavbarProps) {
  return (
    <header
      data-slot="navbar"
      className={cn(
        "sticky top-0 z-40 flex h-14 w-full items-center gap-3 border-b border-border/80 bg-background/80 px-3 backdrop-blur-md sm:gap-4 sm:px-4",
        className,
      )}
      {...props}
    >
      {brand ? (
        <div
          data-slot="navbar-brand"
          className="flex min-w-0 shrink-0 items-center gap-2"
        >
          {brand}
        </div>
      ) : null}

      {search ? (
        <div
          data-slot="navbar-search"
          className="hidden min-w-0 flex-1 md:block"
        >
          {search}
        </div>
      ) : null}

      <div className="min-w-0 flex-1" />

      {children}

      {actions ? (
        <div
          data-slot="navbar-actions"
          className="flex shrink-0 items-center gap-1.5 sm:gap-2"
        >
          {actions}
        </div>
      ) : null}
    </header>
  );
}

function NavbarDivider({ className }: { className?: string }) {
  return (
    <Separator
      orientation="vertical"
      data-slot="navbar-divider"
      className={cn("hidden h-6 sm:block", className)}
    />
  );
}

export { Navbar, NavbarDivider };
export type { NavbarProps };
