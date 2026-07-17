"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { switchCompanyAction } from "@/core/actions/context-actions";
import type { Company } from "@/core/types";
import { cn } from "@/lib/utils";

type CompanyListItemProps = {
  workspaceId: string;
  company: Company;
  active: boolean;
};

function statusLabel(status: Company["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function CompanyListItem({
  workspaceId,
  company,
  active,
}: CompanyListItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || active}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-colors",
        active
          ? "border-white/20 bg-white/[0.06]"
          : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]",
        pending && "opacity-60",
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
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white">{company.name}</p>
        <p className="mt-1 truncate text-xs text-white/45">
          {company.slug}
          {company.type ? ` · ${company.type}` : ""} · {statusLabel(company.status)}
        </p>
      </div>
      {active ? (
        <span className="shrink-0 text-xs text-white/50">Active</span>
      ) : null}
    </button>
  );
}
