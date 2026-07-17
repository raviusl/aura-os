"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  acceptMembershipInvitationAction,
  rejectMembershipInvitationAction,
} from "@/core/actions/membership-actions";
import type { CoreInvitationPreview } from "@/core/auth/invitation-preview";
import {
  acceptCoreInvitationSchema,
  type AcceptCoreInvitationInput,
} from "@/core/schemas";
import {
  authCardClassName,
  authFieldClassName,
  authPrimaryButtonClassName,
} from "@/features/auth/lib/auth-ui";

type AcceptCoreInvitationFormProps = {
  token: string;
  preview: CoreInvitationPreview;
};

/**
 * Identity foundation — accept or reject workspace membership invitation.
 */
export function AcceptCoreInvitationForm({
  token,
  preview,
}: AcceptCoreInvitationFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<AcceptCoreInvitationInput>({
    resolver: zodResolver(acceptCoreInvitationSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div className={authCardClassName}>
      <div className="space-y-1">
        <h1 className="text-lg font-medium text-white">
          {preview.existingAccount ? "Join workspace" : "Accept invitation"}
        </h1>
        <p className="text-sm text-white/50">
          {preview.fullName} · {preview.email}
        </p>
        <p className="text-xs text-white/35">
          {preview.workspaceName} · Role: {preview.role}
        </p>
        {preview.existingAccount ? (
          <p className="pt-2 text-xs text-white/45">
            An account already exists for this email. Enter your password to
            join this workspace.
          </p>
        ) : null}
      </div>

      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            const result = await acceptMembershipInvitationAction(values);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success(
              preview.existingAccount
                ? "Joined workspace"
                : "Account created",
            );
            if (result.data.signedIn) {
              window.location.assign("/dashboard");
              return;
            }
            router.replace("/login");
          });
        })}
      >
        <input type="hidden" {...form.register("token")} />

        <div className="space-y-2">
          <Label htmlFor="core-invite-password">Password</Label>
          <Input
            id="core-invite-password"
            type="password"
            autoComplete={
              preview.existingAccount ? "current-password" : "new-password"
            }
            className={authFieldClassName}
            disabled={pending}
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-red-400">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="core-invite-confirm">Confirm password</Label>
          <Input
            id="core-invite-confirm"
            type="password"
            autoComplete={
              preview.existingAccount ? "current-password" : "new-password"
            }
            className={authFieldClassName}
            disabled={pending}
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword ? (
            <p className="text-xs text-red-400">
              {form.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={pending}
          className={authPrimaryButtonClassName}
        >
          {pending
            ? "Working…"
            : preview.existingAccount
              ? "Join workspace"
              : "Create account"}
        </Button>
      </form>

      <Button
        type="button"
        variant="ghost"
        disabled={pending}
        className="w-full text-white/55 hover:text-white"
        onClick={() => {
          startTransition(async () => {
            const result = await rejectMembershipInvitationAction({ token });
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Invitation rejected");
            router.replace("/login");
          });
        }}
      >
        Reject invitation
      </Button>
    </div>
  );
}
