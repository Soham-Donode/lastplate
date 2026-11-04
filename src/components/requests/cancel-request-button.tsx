"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import { cancelCollectionRequestAction } from "@/actions/ngo";
import { Button } from "@/components/ui/button";

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function cancel() {
    setError(null);
    startTransition(async () => {
      const result = await cancelCollectionRequestAction(requestId);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setConfirming(false);
      router.refresh();
    });
  }

  if (!confirming) {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setConfirming(true)}
      >
        <X className="size-3.5" strokeWidth={2} />
        Cancel request
      </Button>
    );
  }

  return (
    <div className="rounded-control border border-line bg-canvas p-3">
      <p className="text-[11.5px] leading-4 text-secondary">
        Cancel this request? The donation will stay available for other NGOs.
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={cancel} disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <X className="size-3.5" strokeWidth={2} />
          )}
          Confirm cancellation
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setConfirming(false)}
          disabled={isPending}
        >
          Keep request
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-[11.5px] leading-4 text-ink-soft" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
