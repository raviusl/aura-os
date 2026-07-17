import Link from "next/link";
import { redirect } from "next/navigation";

import { requireSessionUserId } from "@/core/auth/session";
import {
  listCompaniesForUserInWorkspace,
  resolveActiveCompany,
} from "@/core/company/active-company";
import { resolveActiveWorkspace } from "@/core/workspace/active-workspace";
import { CompanyListItem } from "@/features/company/components/company-list-item";

export default async function CompaniesPage() {
  const userId = await requireSessionUserId();
  const workspace = await resolveActiveWorkspace(userId);

  if (!workspace) {
    redirect("/dashboard/workspaces/new");
  }

  const [companies, activeContext] = await Promise.all([
    listCompaniesForUserInWorkspace(userId, workspace.id),
    resolveActiveCompany(userId, workspace),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl text-white">Companies</h1>
          <p className="mt-2 text-sm text-white/45">
            Manage companies in{" "}
            <span className="text-white/70">{workspace.name}</span>. One
            workspace can contain multiple companies.
          </p>
        </div>
        <Link
          href="/dashboard/companies/new"
          className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          Create
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-sm text-white/45">
          No companies in this workspace yet. Create one to get started.
        </div>
      ) : (
        <ul className="space-y-3">
          {companies.map((company) => (
            <li key={company.id}>
              <CompanyListItem
                workspaceId={workspace.id}
                company={company}
                active={company.id === activeContext?.company.id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
