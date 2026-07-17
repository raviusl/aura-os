"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { CompanyContextValue } from "@/features/company/lib/company-context";

const CompanyContext = createContext<CompanyContextValue | null>(null);

type CompanyContextProviderProps = {
  value: CompanyContextValue;
  children: ReactNode;
};

export function CompanyContextProvider({
  value,
  children,
}: CompanyContextProviderProps) {
  return (
    <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>
  );
}

export function useCompanyContext(): CompanyContextValue {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompanyContext must be used within CompanyContextProvider");
  }
  return context;
}

export function useActiveCompany() {
  const { company, workspace, membership, permissions } = useCompanyContext();
  return { company, workspace, membership, permissions };
}

export function useCompanyPermissions() {
  const { permissions } = useCompanyContext();
  return useMemo(() => new Set(permissions), [permissions]);
}
