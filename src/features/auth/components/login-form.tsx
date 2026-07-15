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
  signInSchema,
  signUpSchema,
  type SignInInput,
  type SignUpInput,
} from "@/features/auth/schemas/auth";
import { createClient } from "@/lib/supabase/client";

function safeNextPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

type Mode = "signin" | "signup";

function AuthFormInner() {
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const [mode, setMode] = useState<Mode>("signin");
  const [pending, startTransition] = useTransition();

  const signInForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", fullName: "" },
  });

  function switchMode(next: Mode) {
    setMode(next);
    signInForm.clearErrors();
    signUpForm.clearErrors();
  }

  return (
    <div className="w-full max-w-sm space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="space-y-1">
        <Bilingual
          text={mode === "signin" ? copy.signIn : copy.signUp}
          zhClassName="text-lg text-white"
          enClassName="text-white/40"
        />
        <Bilingual
          text={mode === "signin" ? copy.signInSubtitle : copy.signUpSubtitle}
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
          onSubmit={signUpForm.handleSubmit((values) => {
            startTransition(async () => {
              try {
                const supabase = createClient();
                const { data, error } = await supabase.auth.signUp({
                  email: values.email,
                  password: values.password,
                  options: {
                    data: {
                      full_name: values.fullName,
                      display_name: values.fullName,
                    },
                  },
                });
                if (error) {
                  toast.error(error.message);
                  return;
                }

                if (data.session) {
                  window.location.assign(nextPath);
                  return;
                }

                toast.success(
                  `${copy.confirmEmail.zh} / ${copy.confirmEmail.en}`,
                );
                switchMode("signin");
                signInForm.setValue("email", values.email);
              } catch (error) {
                const message =
                  error instanceof Error ? error.message : "Sign up failed";
                toast.error(message);
              }
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="signup-fullname">
              {copy.fullName.zh} / {copy.fullName.en}
            </Label>
            <Input
              id="signup-fullname"
              type="text"
              autoComplete="name"
              className="border-white/10 bg-white/5 text-white"
              {...signUpForm.register("fullName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">
              {copy.email.zh} / {copy.email.en}
            </Label>
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              className="border-white/10 bg-white/5 text-white"
              {...signUpForm.register("email")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">
              {copy.password.zh} / {copy.password.en}
            </Label>
            <Input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              className="border-white/10 bg-white/5 text-white"
              {...signUpForm.register("password")}
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-white text-black hover:bg-white/90"
          >
            {copy.signUp.zh} / {copy.signUp.en}
          </Button>
        </form>
      )}

      <button
        type="button"
        className="w-full text-left text-xs text-white/45 transition-colors hover:text-white/75"
        onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
      >
        {mode === "signin"
          ? `${copy.needAccount.zh} / ${copy.needAccount.en}`
          : `${copy.haveAccount.zh} / ${copy.haveAccount.en}`}
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
