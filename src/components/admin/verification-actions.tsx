"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, X } from "lucide-react";
import type { VerificationStatus } from "@/types";
import { setNgoVerificationAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function VerificationActions({
  ngoId,
  status,
  organizationName,
}: {
  ngoId: string;
  status: VerificationStatus;
  organizationName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeStatus, setActiveStatus] = useState<VerificationStatus | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  function run(nextStatus: VerificationStatus) {
    setError(null);
    setActiveStatus(nextStatus);

    startTransition(async () => {
      const result = await setNgoVerificationAction(ngoId, nextStatus);

      if (!result.ok) {
        setError(result.message);
      } else {
        router.refresh();
      }

      setActiveStatus(null);
    });
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {status !== "verified" && (
          <Button
            size="sm"
            onClick={() => run("verified")}
            disabled={isPending}
            aria-label={`Verify ${organizationName}`}
          >
            {isPending && activeStatus === "verified" ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <Check className="size-3.5" strokeWidth={2} />
            )}
            Verify
          </Button>
        )}

        {status !== "rejected" && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => run("rejected")}
            disabled={isPending}
            aria-label={`Reject verification for ${organizationName}`}
          >
            {isPending && activeStatus === "rejected" ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <X className="size-3.5" strokeWidth={2} />
            )}
            Reject
          </Button>
        )}

        {status !== "pending" && (
          <button
            type="button"
            onClick={() => run("pending")}
            disabled={isPending}
            className="inline-flex h-9 items-center gap-1 rounded-control px-2 text-[11.5px] font-medium text-muted transition-colors hover:bg-surface hover:text-ink disabled:pointer-events-none disabled:opacity-50"
            aria-label={`Return ${organizationName} to the verification queue`}
          >
            {isPending && activeStatus === "pending" ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <RotateCcw className="size-3.5" strokeWidth={1.8} />
            )}
            Reopen
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="text-[11px] leading-4 text-ink-soft">
          {error}
        </p>
      )}
    </div>
  );
}
