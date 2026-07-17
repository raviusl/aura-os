"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  removeMembershipAction,
  restoreMembershipAction,
  revokeMembershipInvitationAction,
  setMembershipRoleAction,
  suspendMembershipAction,
} from "@/core/actions/membership-actions";
import type { CoreInvitation, WorkspaceMember } from "@/core/types";
import { MEMBERSHIP_ROLES } from "@/core/types";

type MembersPanelProps = {
  workspaceId: string;
  members: WorkspaceMember[];
  invitations: CoreInvitation[];
  canInvite: boolean;
  canWrite: boolean;
  canAssignRole: boolean;
};

export function MembersPanel({
  workspaceId,
  members,
  invitations,
  canInvite,
  canWrite,
  canAssignRole,
}: MembersPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const pendingInvites = invitations.filter((row) => row.status === "pending");

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-white">Members</h2>
        <ul className="space-y-2">
          {members.map((member) => (
            <li
              key={member.id}
              className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm text-white">
                    {member.full_name}
                  </p>
                  <p className="truncate text-xs text-white/40">
                    {member.email} · {member.status} ·{" "}
                    {member.roles.join(", ") || "no role"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {canAssignRole && member.status !== "pending" ? (
                    <select
                      className="h-8 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white"
                      disabled={pending}
                      defaultValue={
                        MEMBERSHIP_ROLES.find((role) =>
                          member.roles.includes(role),
                        ) ?? "viewer"
                      }
                      onChange={(event) => {
                        const role = event.target
                          .value as (typeof MEMBERSHIP_ROLES)[number];
                        startTransition(async () => {
                          const result = await setMembershipRoleAction({
                            workspaceId,
                            personId: member.id,
                            role,
                          });
                          if (!result.ok) {
                            toast.error(result.error);
                            return;
                          }
                          toast.success("Role updated");
                          router.refresh();
                        });
                      }}
                    >
                      {MEMBERSHIP_ROLES.map((role) => (
                        <option
                          key={role}
                          value={role}
                          className="bg-[#121214]"
                        >
                          {role}
                        </option>
                      ))}
                    </select>
                  ) : null}

                  {canWrite && member.status === "accepted" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      className="border-white/15 text-white"
                      onClick={() => {
                        startTransition(async () => {
                          const result = await suspendMembershipAction({
                            workspaceId,
                            personId: member.id,
                          });
                          if (!result.ok) {
                            toast.error(result.error);
                            return;
                          }
                          toast.success("Membership suspended");
                          router.refresh();
                        });
                      }}
                    >
                      Suspend
                    </Button>
                  ) : null}

                  {canWrite && member.status === "suspended" ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      className="border-white/15 text-white"
                      onClick={() => {
                        startTransition(async () => {
                          const result = await restoreMembershipAction({
                            workspaceId,
                            personId: member.id,
                          });
                          if (!result.ok) {
                            toast.error(result.error);
                            return;
                          }
                          toast.success("Membership restored");
                          router.refresh();
                        });
                      }}
                    >
                      Restore
                    </Button>
                  ) : null}

                  {canWrite && member.status !== "pending" ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={pending}
                      onClick={() => {
                        startTransition(async () => {
                          const result = await removeMembershipAction({
                            workspaceId,
                            personId: member.id,
                          });
                          if (!result.ok) {
                            toast.error(result.error);
                            return;
                          }
                          toast.success("Membership removed");
                          router.refresh();
                        });
                      }}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-white">Pending invitations</h2>
        {pendingInvites.length === 0 ? (
          <p className="text-xs text-white/40">No pending invitations.</p>
        ) : (
          <ul className="space-y-2">
            {pendingInvites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-col gap-2 rounded-xl border border-white/[0.08] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-white">{invite.full_name}</p>
                  <p className="text-xs text-white/40">
                    {invite.email} · {invite.role_key} · expires{" "}
                    {new Date(invite.expires_at).toLocaleString()}
                  </p>
                </div>
                {canInvite ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    className="border-white/15 text-white"
                    onClick={() => {
                      startTransition(async () => {
                        const result = await revokeMembershipInvitationAction({
                          workspaceId,
                          invitationId: invite.id,
                        });
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
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
