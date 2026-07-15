"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Bilingual } from "@/components/ui/bilingual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { copy } from "@/config/i18n";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      className="w-full max-w-sm space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const supabase = createClient();
          const { error } = await supabase.auth.signInWithPassword(values);
          if (error) {
            toast.error(error.message);
            return;
          }
          router.replace("/dashboard");
          router.refresh();
        });
      })}
    >
      <div className="space-y-1">
        <Bilingual
          text={copy.signIn}
          zhClassName="text-lg text-white"
          enClassName="text-white/40"
        />
        <Bilingual
          text={copy.signInSubtitle}
          compact
          zhClassName="font-normal text-white/55"
          enClassName="text-white/30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          {copy.email.zh} / {copy.email.en}
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          className="border-white/10 bg-white/5 text-white"
          {...form.register("email")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          {copy.password.zh} / {copy.password.en}
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          className="border-white/10 bg-white/5 text-white"
          {...form.register("password")}
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
  );
}
