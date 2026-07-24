"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { Button } from "@/components/ui/button";
import type { Project, Vendor } from "@/core/types";
import { vendorCategoryLabel } from "@/features/vendor/lib/vendor-context";

type ProjectWorkspaceVendorsPanelProps = {
  project: Project;
  vendors: Vendor[];
  canWriteVendor: boolean;
  canReadVendor: boolean;
};

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function ProjectWorkspaceVendorsPanel({
  project,
  vendors,
  canWriteVendor,
  canReadVendor,
}: ProjectWorkspaceVendorsPanelProps) {
  const router = useRouter();

  if (!canReadVendor) {
    return (
      <ModuleEmptyState
        title="Vendors unavailable"
        description="You do not have permission to view vendors for this project."
      />
    );
  }

  const visibleVendors = vendors.filter((vendor) => vendor.status !== "archived");

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-white">
            Linked vendors ({visibleVendors.length})
          </h2>
          <p className="mt-1 text-xs text-white/45">
            Vendors assigned to this project
          </p>
        </div>
        {canWriteVendor && project.status !== "archived" ? (
          <Link
            href={`/dashboard/vendors/new?projectId=${project.id}`}
            className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            Add vendor
          </Link>
        ) : null}
      </div>

      {visibleVendors.length === 0 ? (
        <ModuleEmptyState
          title="No vendors linked"
          description="Assign vendors to this project for delivery coordination."
          actionHref={
            canWriteVendor && project.status !== "archived"
              ? `/dashboard/vendors/new?projectId=${project.id}`
              : undefined
          }
          actionLabel={canWriteVendor ? "Add vendor" : undefined}
        />
      ) : (
        <ul className="space-y-3">
          {visibleVendors.map((vendor) => (
            <li
              key={vendor.id}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {vendor.name}
                  </p>
                  <p className="mt-1 truncate text-xs text-white/45">
                    {vendorCategoryLabel(vendor.category)} ·{" "}
                    {statusLabel(vendor.status)}
                    {vendor.email ? ` · ${vendor.email}` : ""}
                  </p>
                </div>
                {canWriteVendor && vendor.status !== "archived" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/vendors/${vendor.id}/edit`)
                    }
                  >
                    Edit
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
