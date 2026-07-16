import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

function getSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { supabaseUrl, supabaseAnonKey };
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/login";
  const isAuthCallback = pathname === "/auth/callback";
  const isAuthError = pathname === "/auth/error";
  const isUpdatePassword = pathname === "/auth/update-password";
  const isInviteAccept = pathname === "/invite/accept";
  const isDashboard = pathname.startsWith("/dashboard");
  const isRoot = pathname === "/";

  let user: { id: string } | null = null;

  try {
    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Never crash the app if Supabase auth is temporarily unreachable.
    // Unauthenticated routing rules still apply below when user is null.
    user = null;
  }

  if (!user && (isDashboard || isUpdatePassword)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (isDashboard) {
      url.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(url);
  }

  if (user && (isLogin || isRoot)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (!user && isRoot && !isAuthCallback && !isAuthError && !isInviteAccept) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
