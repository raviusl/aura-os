"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MenuIcon } from "lucide-react";

import { Bilingual } from "@/components/ui/bilingual";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { copy, navItems } from "@/config/i18n";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex size-8 items-center justify-center rounded-lg text-white hover:bg-white/[0.06] lg:hidden"
        aria-label="Open navigation"
      >
        <MenuIcon className="size-4" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[280px] border-white/10 bg-[#0a0a0b] p-0 text-white"
      >
        <SheetHeader className="border-b border-white/[0.06] px-5 py-4">
          <SheetTitle className="text-left text-white">
            {copy.appName.en}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-0.5 p-3">
          {navItems.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/55 hover:bg-white/[0.04] hover:text-white/90",
                )}
              >
                <span className="mt-0.5 text-[15px] leading-none" aria-hidden>
                  {item.emoji}
                </span>
                <Bilingual
                  text={item.label}
                  compact
                  zhClassName={cn(
                    "leading-snug",
                    active ? "text-white" : "text-white/80",
                  )}
                  enClassName={cn(
                    "leading-snug",
                    active ? "text-white/45" : "text-white/30",
                  )}
                />
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
