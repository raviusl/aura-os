"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Bilingual } from "@/components/ui/bilingual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copy } from "@/config/i18n";
import {
  forgotPasswordSchema,
  signInSchema,
  type ForgotPasswordInput,
  type SignInInput,
} from "@/features/auth/schemas/auth";
import { createClient } from "@/lib/supabase/client";

function safeNextPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

type Mode = "signin" | "forgot";

function AuthFormInner() {
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const [mode, setMode] = useState<Mode>("signin");
  const [pending, startTransition] = useTransition();

  const signInForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function switchMode(next: Mode) {
    setMode(next);
    signInForm.clearErrors();
    forgotForm.clearErrors();
  }

  return (
    <div className="w-full max-w-sm space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="space-y-1">
        <Bilingual
          text={mode === "signin" ? copy.signIn : copy.forgotPassword}
          zhClassName="text-lg text-white"
          enClassName="text-white/40"
        />
        <Bilingual
          text={
            mode === "signin"
              ? copy.signInSubtitle
              : copy.forgotPasswordSubtitle
          }
          compact
          zhClassName="font-normal text-white/55"
          enClassName="text-white/30"
        />
      </div>

      {mode === "signin" ? (
        <form
          className="space-y-4"
          onSubmit={signInForm.handleSubmit((values) => {
            startTransition(async () => {
              try {
                const supabase = createClient();
                const { error } = await supabase.auth.signInWithPassword(values);
                if (error) {
                  toast.error(error.message);
                  return;
                }
                window.location.assign(nextPath);
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : "Sign in failed";
                toast.error(message);
              }
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="signin-email">
              {copy.email.zh} / {copy.email.en}
            </Label>
            <Input
              id="signin-email"
              type="email"
              autoComplete="email"
              className="border-white/10 bg-white/5 text-white"
              {...signInForm.register("email")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signin-password">
              {copy.password.zh} / {copy.password.en}
            </Label>
            <Input
              id="signin-password"
              type="password"
              autoComplete="current-password"
              className="border-white/10 bg-white/5 text-white"
              {...signInForm.register("password")}
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-white text-black hover:bg-white/90"
          >
            {copy.signIn.zh} / {copy.signIn.en}
          </Button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={forgotForm.handleSubmit((values) => {
            startTransition(async () => {
              try {
                const supabase = createClient();
                const origin = window.location.origin;
                const { error } = await supabase.auth.resetPasswordForEmail(
                  values.email,
                  {
                    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
                  },
                );
                if (error) {
                  toast.error(error.message);
                  return;
                }
                toast.success(
                  `${copy.resetEmailSent.zh} / ${copy.resetEmailSent.en}`,
                );
                switchMode("signin");
                signInForm.setValue("email", values.email);
              } catch (error) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Could not send reset email";
                toast.error(message);
              }
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="forgot-email">
              {copy.email.zh} / {copy.email.en}
            </Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              className="border-white/10 bg-white/5 text-white"
              {...forgotForm.register("email")}
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-white text-black hover:bg-white/90"
          >
            {copy.sendResetLink.zh} / {copy.sendResetLink.en}
          </Button>
        </form>
      )}

      <button
        type="button"
        className="w-full text-left text-xs text-white/45 transition-colors hover:text-white/75"
        onClick={() => switchMode(mode === "signin" ? "forgot" : "signin")}
      >
        {mode === "signin"
          ? `${copy.forgotPassword.zh} / ${copy.forgotPassword.en}`
          : `${copy.backToSignIn.zh} / ${copy.backToSignIn.en}`}
      </button>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense
      fallback={
        <div className="h-72 w-full max-w-sm animate-pulse rounded-2xl bg-white/[0.04]" />
      }
    >
      <AuthFormInner />
    </Suspense>
  );
}
