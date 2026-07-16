"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Bilingual } from "@/components/ui/bilingual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { acceptInvitationAction } from "@/features/auth/actions/invitation-actions";
import { authCopy } from "@/features/auth/copy";
import {
  authCardClassName,
  authFieldClassName,
  authPrimaryButtonClassName,
} from "@/features/auth/lib/auth-ui";
import {
  acceptInvitationSchema,
  INVITE_ROLE_LABELS,
  type AcceptInvitationInput,
  type InviteRole,
} from "@/features/auth/schemas/invite";
import type { AcceptInvitationPreview } from "@/features/auth/invite/accept-invitation";

type AcceptInvitationFormProps = {
  token: string;
  preview: AcceptInvitationPreview;
};

export function AcceptInvitationForm({
  token,
  preview,
}: AcceptInvitationFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<AcceptInvitationInput>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
  });

  const roleLabel =
    INVITE_ROLE_LABELS[preview.role as InviteRole]?.en ?? preview.role;

  return (
    <div className={authCardClassName}>
      <div className="space-y-1">
        <Bilingual
          text={{ zh: "接受邀请", en: "Accept Invitation" }}
          zhClassName="text-lg text-white"
          enClassName="text-white/40"
        />
        <p className="text-sm text-white/50">
          {preview.fullName} · {preview.email}
        </p>
        <p className="text-xs text-white/35">
          {preview.company} · {roleLabel}
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            const result = await acceptInvitationAction(values);
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
          <Label htmlFor="invite-password">
            {authCopy.password.zh} / {authCopy.password.en}
          </Label>
          <Input
            id="invite-password"
            type="password"
            autoComplete="new-password"
            className={authFieldClassName}
            {...form.register("password")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invite-confirm">
            {authCopy.confirmPassword.zh} / {authCopy.confirmPassword.en}
          </Label>
          <Input
            id="invite-confirm"
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
