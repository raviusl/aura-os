import Link from "next/link";

import { requireDashboardContext } from "@/core/auth/context";
import { CompanySettingsForm } from "@/features/company/components/company-settings-form";

export default async function CompanySettingsPage() {
  const context = await requireDashboardContext();
  const canWrite = context.permissions.has("company.write");

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <Link
          href="/dashboard/settings"
          className="text-xs text-white/40 hover:text-white/70"
        >
          ← Settings
        </Link>
        <h1 className="mt-3 text-xl text-white">Company settings</h1>
        <p className="mt-2 text-sm text-white/45">
          Active company:{" "}
          <span className="text-white/70">{context.company.name}</span>
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <CompanySettingsForm company={context.company} canWrite={canWrite} />
      </div>
    </div>
  );
}
