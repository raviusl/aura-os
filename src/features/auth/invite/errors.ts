import "server-only";

import { ZodError } from "zod";

/**
 * Safe, user-facing invitation errors. Provider/DB messages stay server-side.
 */
export class InvitationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "InvitationError";
  }
}

export function toInvitationActionError(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof InvitationError) {
    return error.message;
  }

  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }

  if (
    error instanceof Error &&
    error.message === "Only Super Admins can perform this action."
  ) {
    return error.message;
  }

  console.error("invitation action failed", error);
  return fallback;
}
