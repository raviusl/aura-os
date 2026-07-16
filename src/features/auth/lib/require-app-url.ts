import "server-only";

import { InvitationError } from "@/features/auth/invite/errors";

/**
 * Absolute public app origin for invitation links.
 * Localhost fallback is allowed only outside production.
 */
export function requireAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");

  if (configured) {
    if (
      process.env.NODE_ENV === "production" &&
      isLocalhostUrl(configured)
    ) {
      throw new InvitationError(
        "NEXT_PUBLIC_APP_URL must be a public URL in production.",
      );
    }
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new InvitationError(
      "NEXT_PUBLIC_APP_URL is required to send invitations.",
    );
  }

  return "http://localhost:3000";
}

function isLocalhostUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return true;
  }
}
