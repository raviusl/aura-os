import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireDashboardContext } from "@/core/auth/context";
import { listProjectsByCompany } from "@/core/project/project";
import { getVendorById } from "@/core/vendor/vendor";
import { EditVendorForm } from "@/features/vendor/components/edit-vendor-form";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditVendorPage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireDashboardContext();

  if (!context.permissions.has("vendor.write")) {
    redirect("/dashboard/vendors");
  }

  let vendor;
  try {
    vendor = await getVendorById(id, context.workspace.id);
  } catch {
    notFound();
  }

  if (vendor.company_id !== context.company.id) {
    notFound();
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
        <h1 className="mt-3 text-xl text-white">Edit vendor</h1>
        <p className="mt-2 text-sm text-white/45">{vendor.name}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <EditVendorForm vendor={vendor} projects={projects} />
      </div>
    </div>
  );
}
