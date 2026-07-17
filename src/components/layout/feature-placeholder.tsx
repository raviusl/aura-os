import Link from "next/link";

import { AppEmptyState } from "@/components/layout/app-empty-state";
import { Bilingual } from "@/components/ui/bilingual";
import { copy, type BilingualText } from "@/config/i18n";

export function FeaturePlaceholder({ title }: { title: BilingualText }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Bilingual
        text={title}
        zhClassName="text-xl text-white"
        enClassName="text-white/40"
      />
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
        <AppEmptyState
          title={
            <Bilingual
              text={copy.comingSoonTitle}
              className="items-center"
              zhClassName="text-sm text-foreground/90"
              enClassName="text-muted-foreground"
            />
          }
          description={
            <Bilingual
              text={copy.comingSoonDescription}
              className="items-center"
              zhClassName="text-xs font-normal text-muted-foreground"
              enClassName="text-[11px] text-muted-foreground/80"
            />
          }
        />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white hover:bg-white/[0.05]"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/projects"
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
