import type { Vendor } from "@/core/types";

export type VendorContextValue = {
  workspaceId: string | null;
  companyId: string | null;
  vendors: Vendor[];
};

export function toVendorContextValue(input: {
  workspaceId: string | null;
  companyId: string | null;
  vendors: Vendor[];
}): VendorContextValue {
  return {
    workspaceId: input.workspaceId,
    companyId: input.companyId,
    vendors: input.vendors,
  };
}

export function vendorCategoryLabel(
  category: Vendor["category"],
): string {
  if (!category) return "Unspecified";
  const labels: Record<NonNullable<Vendor["category"]>, string> = {
    photographer: "Photographer",
    videographer: "Videographer",
    decorator: "Decorator",
    makeup_artist: "Makeup Artist",
    live_band: "Live Band",
    emcee: "Emcee",
    venue: "Venue",
    catering: "Catering",
    florist: "Florist",
    others: "Others",
  };
  return labels[category];
}
