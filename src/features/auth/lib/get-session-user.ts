import "server-only";

import { createClient } from "@/lib/supabase/server";

/** Shared session user fetch for Super Admin gates. */
export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}
