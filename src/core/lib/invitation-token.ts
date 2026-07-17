import "server-only";

import { createHash, randomBytes } from "crypto";

export const CORE_INVITATION_TTL_HOURS = 72;

export function generateCoreInvitationToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashCoreInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
