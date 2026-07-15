"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { copy } from "@/config/i18n";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      className="text-white/45 hover:bg-white/5 hover:text-white"
      onClick={() => {
        startTransition(async () => {
          try {
            const supabase = createClient();
            const { error } = await supabase.auth.signOut();
            if (error) {
              toast.error(error.message);
              return;
            }
            // Hard navigation ensures cleared auth cookies apply immediately.
            window.location.assign("/login");
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Sign out failed";
            toast.error(message);
          }
        });
      }}
    >
      {copy.signOut.zh} / {copy.signOut.en}
    </Button>
  );
}
