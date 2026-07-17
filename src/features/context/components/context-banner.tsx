import type { SessionContext } from "@/core/types";

type ContextBannerProps = {
  context: SessionContext;
};

export function ContextBanner({ context }: ContextBannerProps) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm">
      <p className="text-white/80">
        <span className="text-white/45">Workspace</span>{" "}
        {context.workspace.name}
        <span className="mx-2 text-white/20">·</span>
        <span className="text-white/45">Company</span> {context.company.name}
        <span className="mx-2 text-white/20">·</span>
        <span className="text-white/45">Role</span>{" "}
        {context.membership.role_key}
      </p>
    </div>
  );
}
