"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { revokeInvitationAction } from "@/features/auth/actions/invitation-actions";
import { INVITE_ROLE_LABELS, type InviteRole } from "@/features/auth/schemas/invite";
import type { InvitationListItem } from "@/features/auth/invite/list-invitations";
import { StatusBadge } from "@/components/ui/status-badge";

const statusMap = {
  pending: "warning",
  accepted: "success",
  expired: "default",
  revoked: "danger",
} as const;

export function InvitationsTable({
  invitations,
}: {
  invitations: InvitationListItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            User Management
          </h1>
          <p className="mt-1 text-sm text-white/45">
            Invitation-only access. Only Super Admins can invite users.
          </p>
        </div>
        <Link href="/dashboard/settings/users/invite">
          <Button className="bg-white text-black hover:bg-white/90">
            Invite User
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        {invitations.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-white/45">
            No invitations yet. Invite your first teammate.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-white/40">Name</TableHead>
                <TableHead className="text-white/40">Email</TableHead>
                <TableHead className="text-white/40">Company</TableHead>
                <TableHead className="text-white/40">Role</TableHead>
                <TableHead className="text-white/40">Status</TableHead>
                <TableHead className="text-white/40">Expires</TableHead>
                <TableHead className="text-right text-white/40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-white/[0.06] hover:bg-white/[0.03]"
                >
                  <TableCell className="font-medium text-white/90">
                    {row.full_name}
                  </TableCell>
                  <TableCell className="text-white/70">{row.email}</TableCell>
                  <TableCell className="text-white/70">{row.company}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/15 text-white/80">
                      {INVITE_ROLE_LABELS[row.role as InviteRole]?.en ?? row.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={statusMap[row.status]}
                      label={row.status}
                    />
                  </TableCell>
                  <TableCell className="text-white/55">
                    {new Date(row.expires_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.status === "pending" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={pending}
                        className="text-white/70 hover:bg-white/5 hover:text-white"
                        onClick={() => {
                          startTransition(async () => {
                            const result = await revokeInvitationAction(row.id);
                            if (!result.ok) {
                              toast.error(result.error);
                              return;
                            }
                            toast.success("Invitation revoked");
                            router.refresh();
                          });
                        }}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <span className="text-xs text-white/30">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
