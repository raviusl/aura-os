import Link from "next/link";

import { requireDashboardContext } from "@/core/auth/context";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { VendorListItem } from "@/features/vendor/components/vendor-list-item";

export default async function VendorsPage() {
  const context = await requireDashboardContext();
  const vendors = await listVendorsByCompany(
    context.workspace.id,
    context.company.id,
  );
  const canWrite = context.permissions.has("vendor.write");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl text-white">Vendors</h1>
          <p className="mt-2 text-sm text-white/45">
            Vendors in{" "}
            <span className="text-white/70">{context.company.name}</span>
          </p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/vendors/new"
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            Create
          </Link>
        ) : null}
      </div>

      {vendors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-5 py-8 text-sm text-white/45">
          No vendors in this company yet.
          {canWrite ? " Create one to get started." : ""}
        </div>
      ) : (
        <ul className="space-y-3">
          {vendors.map((vendor) => (
            <li key={vendor.id}>
              <VendorListItem
                workspaceId={context.workspace.id}
                companyId={context.company.id}
                vendor={vendor}
                canWrite={canWrite}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
