"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronsUpDownIcon } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { switchCompanyAction } from "@/core/actions/context-actions";
import type { Company } from "@/core/types";
import { cn } from "@/lib/utils";

type CompanySwitcherProps = {
  workspaceId: string;
  companies: Company[];
  activeCompany: Company | null;
};

export function CompanySwitcher({
  workspaceId,
  companies,
  activeCompany,
}: CompanySwitcherProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (companies.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-9 max-w-[200px] items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white outline-none hover:bg-white/[0.06] disabled:opacity-50"
        disabled={pending}
      >
        <span className="truncate">
          {activeCompany?.name ?? "Select company"}
        </span>
        <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[220px] border-white/10 bg-[#121214] text-white"
      >
        <DropdownMenuLabel className="text-xs text-white/45">
          Companies
        </DropdownMenuLabel>
        {companies.map((company) => {
          const active = company.id === activeCompany?.id;
          return (
            <DropdownMenuItem
              key={company.id}
              disabled={pending || active}
              className={cn(
                "cursor-pointer truncate text-sm",
                active && "bg-white/[0.08]",
              )}
              onClick={() => {
                if (active) return;
                startTransition(async () => {
                  const result = await switchCompanyAction({
                    workspaceId,
                    companyId: company.id,
                  });
                  if (!result.ok) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success(`Switched to ${company.name}`);
                  router.refresh();
                });
              }}
            >
              {company.name}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="cursor-pointer text-sm"
          onClick={() => router.push("/dashboard/select-company")}
        >
          Manage companies
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
