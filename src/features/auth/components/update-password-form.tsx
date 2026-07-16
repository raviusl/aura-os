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
import { copy } from "@/config/i18n";
import {
  updatePasswordSchema,
  type UpdatePasswordInput,
} from "@/features/auth/schemas/auth";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  return (
    <div className="w-full max-w-sm space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="space-y-1">
        <Bilingual
          text={copy.updatePassword}
          zhClassName="text-lg text-white"
          enClassName="text-white/40"
        />
        <Bilingual
          text={copy.updatePasswordSubtitle}
          compact
          zhClassName="font-normal text-white/55"
          enClassName="text-white/30"
        />
      </div>

      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          startTransition(async () => {
            try {
              const supabase = createClient();
              const { error } = await supabase.auth.updateUser({
                password: values.password,
              });
              if (error) {
                toast.error(error.message);
                return;
              }
              toast.success(
                `${copy.passwordUpdated.zh} / ${copy.passwordUpdated.en}`,
              );
              router.replace("/dashboard");
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not update password";
              toast.error(message);
            }
          });
        })}
      >
        <div className="space-y-2">
          <Label htmlFor="new-password">
            {copy.password.zh} / {copy.password.en}
          </Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            className="border-white/10 bg-white/5 text-white"
            {...form.register("password")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">
            {copy.confirmPassword.zh} / {copy.confirmPassword.en}
          </Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            className="border-white/10 bg-white/5 text-white"
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
          className="w-full bg-white text-black hover:bg-white/90"
        >
          {copy.updatePassword.zh} / {copy.updatePassword.en}
        </Button>
      </form>
    </div>
  );
}
