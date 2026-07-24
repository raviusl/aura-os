"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  archiveVendorAction,
  deactivateVendorAction,
  restoreVendorAction,
} from "@/core/actions/vendor-actions";
import type { Vendor } from "@/core/types";
import { vendorCategoryLabel } from "@/features/vendor/lib/vendor-context";

type VendorListItemProps = {
  workspaceId: string;
  companyId: string;
  vendor: Vendor;
  canWrite: boolean;
  projectName?: string | null;
};

function statusLabel(status: Vendor["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function VendorListItem({
  workspaceId,
  companyId,
  vendor,
  canWrite,
  projectName,
}: VendorListItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{vendor.name}</p>
          <p className="mt-1 truncate text-xs text-white/45">
            {vendorCategoryLabel(vendor.category)} · {statusLabel(vendor.status)}
            {vendor.email ? ` · ${vendor.email}` : ""}
            {vendor.phone ? ` · ${vendor.phone}` : ""}
          </p>
          {vendor.project_id && projectName ? (
            <Link
              href={`/dashboard/projects/${vendor.project_id}`}
              className="mt-1 inline-block truncate text-xs text-white/40 hover:text-white/70"
            >
              Project · {projectName}
            </Link>
          ) : null}
        </div>
        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            {vendor.status !== "archived" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  router.push(`/dashboard/vendors/${vendor.id}/edit`)
                }
              >
                Edit
              </Button>
            ) : null}
            {vendor.status === "active" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await deactivateVendorAction({
                      workspaceId,
                      companyId,
                      vendorId: vendor.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Vendor deactivated");
                    router.refresh();
                  });
                }}
              >
                Deactivate
              </Button>
            ) : null}
            {vendor.status !== "archived" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await archiveVendorAction({
                      workspaceId,
                      companyId,
                      vendorId: vendor.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Vendor archived");
                    router.refresh();
                  });
                }}
              >
                Archive
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await restoreVendorAction({
                      workspaceId,
                      companyId,
                      vendorId: vendor.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Vendor restored");
                    router.refresh();
                  });
                }}
              >
                Restore
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
