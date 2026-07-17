"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { VendorContextValue } from "@/features/vendor/lib/vendor-context";

const VendorContext = createContext<VendorContextValue | null>(null);

type VendorContextProviderProps = {
  value: VendorContextValue;
  children: ReactNode;
};

export function VendorContextProvider({
  value,
  children,
}: VendorContextProviderProps) {
  return (
    <VendorContext.Provider value={value}>{children}</VendorContext.Provider>
  );
}

export function useVendorContext(): VendorContextValue {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error(
      "useVendorContext must be used within VendorContextProvider",
    );
  }
  return context;
}

export function useCompanyVendors() {
  const { vendors, companyId, workspaceId } = useVendorContext();
  return { vendors, companyId, workspaceId };
}
