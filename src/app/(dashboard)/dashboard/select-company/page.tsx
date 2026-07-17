import { requireSessionUserId } from "@/core/auth/session";
import { listCompaniesForUserInWorkspace } from "@/core/company/active-company";
import { resolveActiveWorkspace } from "@/core/workspace/active-workspace";
import { CompanySelectList } from "@/features/context/components/company-select-list";
import { redirect } from "next/navigation";

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
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-sm text-white/45">
          No companies in this workspace yet.
        </div>
      ) : (
        <CompanySelectList workspaceId={workspace.id} companies={companies} />
      )}
    </div>
  );
}
