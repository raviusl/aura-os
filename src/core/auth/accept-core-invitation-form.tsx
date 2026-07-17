"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { acceptCoreInvitationAction } from "@/core/actions/core-actions";
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
 * Auth foundation only — password creation after invitation.
 * Not a business dashboard UI.
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
        <h1 className="text-lg font-medium text-white">Accept Invitation</h1>
        <p className="text-sm text-white/50">
          {preview.fullName} · {preview.email}
        </p>
        <p className="text-xs text-white/35">Role: {preview.role}</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            const result = await acceptCoreInvitationAction(values);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("Account created");
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
            autoComplete="new-password"
            className={authFieldClassName}
            {...form.register("password")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="core-invite-confirm">Confirm password</Label>
          <Input
            id="core-invite-confirm"
            type="password"
            autoComplete="new-password"
            className={authFieldClassName}
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          disabled={pending}
          className={authPrimaryButtonClassName}
        >
          {pending ? "Creating…" : "Create password & continue"}
        </Button>
      </form>
    </div>
  );
}
