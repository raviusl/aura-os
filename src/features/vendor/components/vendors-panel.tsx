import Link from "next/link";

import type { Vendor } from "@/core/types";
import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { vendorCategoryLabel } from "@/features/vendor/lib/vendor-context";

type VendorsPanelProps = {
  vendors: Vendor[];
  companyName: string;
  canWrite: boolean;
};

function statusLabel(status: Vendor["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function VendorsPanel({
  vendors,
  companyName,
  canWrite,
}: VendorsPanelProps) {
  const visible = vendors.filter((vendor) => vendor.status !== "archived");

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-white">
            Vendors ({visible.length})
          </h2>
          <p className="mt-1 text-xs text-white/45">{companyName}</p>
        </div>
        {canWrite ? (
          <Link
            href="/dashboard/vendors/new"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            New
          </Link>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className="mt-4">
          <ModuleEmptyState
            title="No vendors yet"
            description="Add photographers, venues, caterers, and other vendors for this company."
            actionHref={canWrite ? "/dashboard/vendors/new" : undefined}
            actionLabel={canWrite ? "Create vendor" : undefined}
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {visible.slice(0, 6).map((vendor) => (
            <li
              key={vendor.id}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">{vendor.name}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {vendorCategoryLabel(vendor.category)} ·{" "}
                    {statusLabel(vendor.status)}
                  </p>
                </div>
                <Link
                  href={
                    canWrite
                      ? `/dashboard/vendors/${vendor.id}/edit`
                      : "/dashboard/vendors"
                  }
                  className="shrink-0 text-xs text-white/45 hover:text-white/70"
                >
                  {canWrite ? "Edit" : "View"}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}

      {visible.length > 0 ? (
        <div className="mt-3">
          <Link
            href="/dashboard/vendors"
            className="text-xs text-white/45 hover:text-white/70"
          >
            Manage vendors →
          </Link>
        </div>
      ) : null}
    </section>
  );
}
