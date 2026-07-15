import { Bilingual } from "@/components/ui/bilingual";
import { EmptyState } from "@/components/ui/empty-state";
import type { BilingualText } from "@/config/i18n";

export function FeaturePlaceholder({ title }: { title: BilingualText }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Bilingual
        text={title}
        zhClassName="text-xl text-white"
        enClassName="text-white/40"
      />
      <EmptyState />
    </div>
  );
}
