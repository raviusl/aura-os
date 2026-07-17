"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-xl text-white">Something went wrong</h1>
      <p className="text-sm text-white/45">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          type="button"
          onClick={reset}
          className="bg-white text-black hover:bg-white/90"
        >
          Try again
        </Button>
        <Link
          href="/dashboard"
          className="inline-flex h-8 items-center rounded-lg border border-white/10 px-3 text-sm text-white hover:bg-white/[0.05]"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
