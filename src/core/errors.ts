import { ZodError } from "zod";

/**
 * Safe, user-facing core errors. Provider/DB messages stay server-side.
 */
export class CoreError extends Error {
  readonly code: string;

  constructor(code: string, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "CoreError";
    this.code = code;
  }
}

export function toCoreUserMessage(error: unknown, fallback: string): string {
  if (error instanceof CoreError) {
    return error.message;
  }
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? fallback;
  }
  console.error("core operation failed", error);
  return fallback;
}
