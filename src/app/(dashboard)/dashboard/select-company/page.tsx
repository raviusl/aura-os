import Link from "next/link";
import { redirect } from "next/navigation";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { requireSessionUserId } from "@/core/auth/session";
import { listCompaniesForUserInWorkspace } from "@/core/company/active-company";
import { resolveActiveWorkspace } from "@/core/workspace/active-workspace";
import { CompanySelectList } from "@/features/context/components/company-select-list";

export default async function SelectCompanyPage() {
  const userId = await requireSessionUserId();
  const workspace = await resolveActiveWorkspace(userId);

  if (!workspace) {
    redirect("/dashboard/select-workspace");
  }

  const companies = await listCompaniesForUserInWorkspace(userId, workspace.id);

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div>
        <h1 className="text-xl text-white">Select company</h1>
        <p className="mt-2 text-sm text-white/45">
          Workspace: <span className="text-white/70">{workspace.name}</span>.
          Choose a company to open the dashboard.
        </p>
      </div>

      {companies.length === 0 ? (
        <ModuleEmptyState
          title="No companies yet"
          description="Create a company in this workspace to continue."
          actionHref="/dashboard/companies/new"
          actionLabel="Create company"
        />
      ) : (
        <CompanySelectList workspaceId={workspace.id} companies={companies} />
      )}

      <Link
        href="/dashboard/select-workspace"
        className="inline-block text-xs text-white/40 hover:text-white/70"
      >
        ← Switch workspace
      </Link>
    </div>
  );
}
