import type { Client } from "@/core/types";

export type ClientContextValue = {
  workspaceId: string | null;
  companyId: string | null;
  clients: Client[];
};

export function toClientContextValue(input: {
  workspaceId: string | null;
  companyId: string | null;
  clients: Client[];
}): ClientContextValue {
  return {
    workspaceId: input.workspaceId,
    companyId: input.companyId,
    clients: input.clients,
  };
}
