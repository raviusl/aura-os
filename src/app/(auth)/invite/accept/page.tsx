import { AcceptInvitationForm } from "@/features/auth/components/accept-invitation-form";
import { getInvitationPreview } from "@/features/auth/invite/accept-invitation";
import { InvitationError } from "@/features/auth/invite/errors";

type PageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  if (!token) {
    return (
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-sm text-white/70">
        Missing invitation token. Open the link from your invitation email.
      </div>
    );
  }

  try {
    const preview = await getInvitationPreview(token);
    return <AcceptInvitationForm token={token} preview={preview} />;
  } catch (error) {
    const message =
      error instanceof InvitationError
        ? error.message
        : "This invitation is invalid or has expired.";

    if (!(error instanceof InvitationError)) {
      console.error("invite accept preview failed", error);
    }

    return (
      <div className="w-full max-w-sm rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-sm text-white/70">
        {message}
      </div>
    );
  }
}
