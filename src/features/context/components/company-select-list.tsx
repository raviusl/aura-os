"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { selectCompanyAndContinueAction } from "@/core/actions/context-actions";
import type { Company } from "@/core/types";

type CompanySelectListProps = {
  workspaceId: string;
  companies: Company[];
};

export function CompanySelectList({
  workspaceId,
  companies,
}: CompanySelectListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <ul className="space-y-2">
      {companies.map((company) => (
        <li key={company.id}>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await selectCompanyAndContinueAction({
                  workspaceId,
                  companyId: company.id,
                });
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                router.push("/dashboard");
                router.refresh();
              });
            }}
            className="block w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-left transition-colors hover:bg-white/[0.06] disabled:opacity-60"
          >
            <p className="text-sm font-medium text-white">{company.name}</p>
            <p className="mt-1 text-xs text-white/40">
              {company.slug}
              {company.type ? ` · ${company.type}` : ""}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}
