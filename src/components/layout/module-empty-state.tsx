import Link from "next/link";

type ModuleEmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
};

export function ModuleEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: ModuleEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center">
      <p className="text-sm font-medium text-white/80">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-white/45">{description}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-5 inline-flex rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
