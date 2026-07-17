import Link from "next/link";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
            className="inline-flex w-fit rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            Create
          </Link>
        ) : null}
      </div>

      {vendors.length === 0 ? (
        <ModuleEmptyState
          title="No vendors yet"
          description="Add photographers, venues, caterers, and other vendors."
          actionHref={canWrite ? "/dashboard/vendors/new" : undefined}
          actionLabel={canWrite ? "Create vendor" : undefined}
        />
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
