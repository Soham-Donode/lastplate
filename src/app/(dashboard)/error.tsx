"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-panel border border-line bg-paper p-8 text-center">
        <LogoMark className="mx-auto size-10" />
        <h1 className="mt-5 text-[20px] font-semibold text-ink">
          Something went wrong
        </h1>
        <p className="mt-2 text-[13px] leading-5 text-muted">
          We could not load this part of your workspace. Try again — if the
          problem continues, check your database connection.
        </p>
        <Button onClick={reset} className="mt-6">
          <RotateCcw className="size-4" strokeWidth={1.8} />
          Try again
        </Button>
      </div>
    </div>
  );
}
