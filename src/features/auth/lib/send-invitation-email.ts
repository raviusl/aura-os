import "server-only";

import { Resend } from "resend";

import { siteConfig } from "@/config/site";

type SendInvitationEmailInput = {
  to: string;
  fullName: string;
  company: string;
  roleLabel: string;
  inviteUrl: string;
  expiresAt: Date;
};

export type SendInvitationEmailResult =
  | { ok: true; provider: "resend"; id?: string }
  | { ok: true; provider: "dev_fallback"; warning: string }
  | { ok: false; provider: "resend" | "none"; error: string };

export async function sendInvitationEmail(
  input: SendInvitationEmailInput,
): Promise<SendInvitationEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.RESEND_FROM_EMAIL ?? "RIVA OS <onboarding@resend.dev>";

  const subject = `You're invited to ${siteConfig.name}`;
  const expiresLabel = input.expiresAt.toUTCString();
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; color: #111;">
      <h1 style="font-size: 22px; font-weight: 600; margin-bottom: 8px;">Join ${siteConfig.name}</h1>
      <p style="color: #555; line-height: 1.5;">
        Hi ${escapeHtml(input.fullName)}, you have been invited to join
        <strong>${escapeHtml(input.company)}</strong> as
        <strong>${escapeHtml(input.roleLabel)}</strong>.
      </p>
      <p style="margin: 28px 0;">
        <a href="${escapeHtml(input.inviteUrl)}" style="display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-size: 14px;">
          Accept invitation
        </a>
      </p>
      <p style="color: #777; font-size: 13px; line-height: 1.5;">
        This invitation expires on <strong>${expiresLabel}</strong> (72 hours).
        If you did not expect this email, you can ignore it.
      </p>
    </div>
  `;

  if (!apiKey) {
    return {
      ok: true,
      provider: "dev_fallback",
      warning:
        "RESEND_API_KEY is not set. Invitation was created; share the invite link manually.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: input.to,
      subject,
      html,
    });

    if (error) {
      return { ok: false, provider: "resend", error: error.message };
    }

    return { ok: true, provider: "resend", id: data?.id };
  } catch (error) {
    return {
      ok: false,
      provider: "resend",
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
