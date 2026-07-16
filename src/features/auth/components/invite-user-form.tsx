"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInvitationAction } from "@/features/auth/actions/invitation-actions";
import {
  INVITE_ROLE_LABELS,
  INVITE_ROLES,
  inviteUserSchema,
  type InviteUserInput,
} from "@/features/auth/schemas/invite";

const fieldClass =
  "border-white/10 bg-white/5 text-white placeholder:text-white/30";

export function InviteUserForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      role: "staff",
    },
  });

  return (
    <form
      className="mx-auto w-full max-w-xl space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await createInvitationAction(values);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }

          if (result.data.emailSent) {
            toast.success(`Invitation sent to ${result.data.email}`);
          } else {
            toast.success("Invitation created");
            if (result.data.emailWarning) {
              toast.message(result.data.emailWarning);
            }
            if (result.data.inviteUrl) {
              toast.message("Invite link (copy now)", {
                description: result.data.inviteUrl,
                duration: 20_000,
              });
            }
          }

          router.push("/dashboard/settings/users");
          router.refresh();
        });
      })}
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Invite User
        </h1>
        <p className="text-sm text-white/45">
          Create a secure invitation. The user sets a password after opening the
          email link. Invitations expire in 72 hours and can be used once.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          className={fieldClass}
          autoComplete="name"
          {...form.register("fullName")}
        />
        {form.formState.errors.fullName ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.fullName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          className={fieldClass}
          autoComplete="email"
          {...form.register("email")}
        />
        {form.formState.errors.email ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          className={fieldClass}
          autoComplete="organization"
          {...form.register("company")}
        />
        {form.formState.errors.company ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.company.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Controller
          control={form.control}
          name="role"
          render={({ field }) => (
            <select
              id="role"
              className={`flex h-9 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${fieldClass}`}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            >
              {INVITE_ROLES.map((role) => (
                <option key={role} value={role} className="bg-[#111] text-white">
                  {INVITE_ROLE_LABELS[role].en}
                </option>
              ))}
            </select>
          )}
        />
        {form.formState.errors.role ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.role.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          type="submit"
          disabled={pending}
          className="bg-white text-black hover:bg-white/90"
        >
          {pending ? "Sending…" : "Send Invitation"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-white/15 bg-transparent text-white hover:bg-white/5"
          onClick={() => router.push("/dashboard/settings/users")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
