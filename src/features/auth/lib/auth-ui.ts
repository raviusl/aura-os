/** Shared auth field styling for login / password screens. */
export const authFieldClassName =
  "border-white/10 bg-white/5 text-white";

export const authCardClassName =
  "w-full max-w-sm space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]";

export const authPrimaryButtonClassName =
  "w-full bg-white text-black hover:bg-white/90";

/**
 * Prevent open redirects after auth. Only same-origin relative paths allowed.
 */
export function safeAuthNextPath(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}
