"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { ClientContextValue } from "@/features/client/lib/client-context";

const ClientContext = createContext<ClientContextValue | null>(null);

type ClientContextProviderProps = {
  value: ClientContextValue;
  children: ReactNode;
};

export function ClientContextProvider({
  value,
  children,
}: ClientContextProviderProps) {
  return (
    <ClientContext.Provider value={value}>{children}</ClientContext.Provider>
  );
}

export function useClientContext(): ClientContextValue {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error(
      "useClientContext must be used within ClientContextProvider",
    );
  }
  return context;
}

export function useCompanyClients() {
  const { clients, companyId, workspaceId } = useClientContext();
  return { clients, companyId, workspaceId };
}
