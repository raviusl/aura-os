import { Loading } from "@/components/ui/loading";

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl items-center justify-center py-24">
      <Loading label="Loading…" className="text-white/55" />
    </div>
  );
}
