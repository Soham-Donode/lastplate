"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { respondToRequestAction } from "@/actions/donations";
import { Button } from "@/components/ui/button";

export function RequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function respond(action: "accept" | "reject") {
    setError(null);
    startTransition(async () => {
      const result = await respondToRequestAction(requestId, action);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setConfirming(false);
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="mt-3 glass-well rounded-control p-3">
        <p className="text-[11.5px] leading-4 text-secondary">
          Accepting this request assigns the donation to this NGO and declines
          every other pending request for it.
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => respond("accept")}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <Check className="size-3.5" strokeWidth={2} />
            )}
            Confirm acceptance
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirming(false)}
            disabled={isPending}
          >
            Cancel
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

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          onClick={() => setConfirming(true)}
          disabled={isPending}
        >
          <Check className="size-3.5" strokeWidth={2} />
          Accept request
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => respond("reject")}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <X className="size-3.5" strokeWidth={2} />
          )}
          Decline
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
