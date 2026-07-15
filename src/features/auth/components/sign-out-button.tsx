"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { copy } from "@/config/i18n";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      className="text-white/45 hover:bg-white/5 hover:text-white"
      onClick={() => {
        startTransition(async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          router.replace("/login");
          router.refresh();
        });
      }}
    >
      {copy.signOut.zh} / {copy.signOut.en}
    </Button>
  );
}
