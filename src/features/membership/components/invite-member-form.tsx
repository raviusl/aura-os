"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteMemberAction } from "@/core/actions/membership-actions";
import { MEMBERSHIP_ROLES } from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";

const formSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(160),
  role: z.enum(MEMBERSHIP_ROLES),
});

type FormValues = z.infer<typeof formSchema>;

type InviteMemberFormProps = {
  workspaceId: string;
};

export function InviteMemberForm({ workspaceId }: InviteMemberFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: "viewer",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await inviteMemberAction({
            workspaceId,
            email: values.email,
            fullName: values.fullName,
            role: values.role,
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(
            result.data.emailSent
              ? `Invitation sent to ${result.data.email}`
              : `Invitation created for ${result.data.email}`,
          );
          if (result.data.inviteUrl) {
            toast.message("Invite URL (email not sent)", {
              description: result.data.inviteUrl,
            });
          }
          form.reset({ email: "", fullName: "", role: "viewer" });
          router.refresh();
        });
      })}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="invite-name">Full name</Label>
          <Input
            id="invite-name"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("fullName")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("email")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-role">Role</Label>
        <select
          id="invite-role"
          className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
          disabled={pending}
          {...form.register("role")}
        >
          {MEMBERSHIP_ROLES.map((role) => (
            <option key={role} value={role} className="bg-[#121214]">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-white text-black hover:bg-white/90"
      >
        {pending ? "Sending…" : "Send invitation"}
      </Button>
    </form>
  );
}
