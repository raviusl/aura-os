"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  archiveClientAction,
  markClientFollowUpAction,
  restoreClientAction,
} from "@/core/actions/client-actions";
import type { Client } from "@/core/types";

type ClientListItemProps = {
  workspaceId: string;
  companyId: string;
  client: Client;
  canWrite: boolean;
};

function typeLabel(type: Client["client_type"]) {
  if (!type) return "Unspecified";
  if (type === "corporate") return "Corporate Client";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function statusLabel(status: Client["status"]) {
  if (status === "follow_up") return "Follow-up";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function ClientListItem({
  workspaceId,
  companyId,
  client,
  canWrite,
}: ClientListItemProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{client.name}</p>
          <p className="mt-1 truncate text-xs text-white/45">
            {typeLabel(client.client_type)} · {statusLabel(client.status)}
            {client.email ? ` · ${client.email}` : ""}
            {client.phone ? ` · ${client.phone}` : ""}
          </p>
        </div>
        {canWrite ? (
          <div className="flex flex-wrap gap-2">
            {client.status !== "archived" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  router.push(`/dashboard/clients/${client.id}/edit`)
                }
              >
                Edit
              </Button>
            ) : null}
            {client.status === "active" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await markClientFollowUpAction({
                      workspaceId,
                      companyId,
                      clientId: client.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Marked for follow-up");
                    router.refresh();
                  });
                }}
              >
                Follow-up
              </Button>
            ) : null}
            {client.status !== "archived" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await archiveClientAction({
                      workspaceId,
                      companyId,
                      clientId: client.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Client archived");
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
                    const result = await restoreClientAction({
                      workspaceId,
                      companyId,
                      clientId: client.id,
                    });
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    toast.success("Client restored");
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
