import Link from "next/link";
import { redirect } from "next/navigation";

import { requireDashboardContext } from "@/core/auth/context";
import { listProjectsByCompany } from "@/core/project/project";
import { CreateVendorForm } from "@/features/vendor/components/create-vendor-form";

export default async function NewVendorPage() {
  const context = await requireDashboardContext();

  if (!context.permissions.has("vendor.write")) {
    redirect("/dashboard/vendors");
  }

  const projects = await listProjectsByCompany(
    context.workspace.id,
    context.company.id,
  );

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href="/dashboard/vendors"
          className="text-xs text-white/40 hover:text-white/70"
        >
          ← Vendors
        </Link>
        <h1 className="mt-3 text-xl text-white">Create vendor</h1>
        <p className="mt-2 text-sm text-white/45">
          Add a vendor to{" "}
          <span className="text-white/70">{context.company.name}</span>.
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <CreateVendorForm
          workspaceId={context.workspace.id}
          companyId={context.company.id}
          projects={projects}
        />
      </div>
    </div>
  );
}
