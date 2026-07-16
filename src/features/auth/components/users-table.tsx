"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { INVITE_ROLE_LABELS, type InviteRole } from "@/features/auth/schemas/invite";
import type { ManagedUser } from "@/features/auth/invite/list-managed-users";

function roleLabel(role: string | null) {
  if (!role) return "—";
  return INVITE_ROLE_LABELS[role as InviteRole]?.en ?? role;
}

export function UsersTable({ users }: { users: ManagedUser[] }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-medium tracking-wide text-white/80">
          Users
        </h2>
        <p className="mt-1 text-xs text-white/40">
          Accounts that have accepted an invitation.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        {users.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-white/45">
            No users yet. Invite someone to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-white/40">Name</TableHead>
                <TableHead className="text-white/40">Email</TableHead>
                <TableHead className="text-white/40">Company</TableHead>
                <TableHead className="text-white/40">Role</TableHead>
                <TableHead className="text-white/40">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-white/[0.06] hover:bg-white/[0.03]"
                >
                  <TableCell className="font-medium text-white/90">
                    {user.fullName}
                  </TableCell>
                  <TableCell className="text-white/70">{user.email || "—"}</TableCell>
                  <TableCell className="text-white/70">
                    {user.company || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-white/15 text-white/80"
                    >
                      {roleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/55">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </section>
  );
}
