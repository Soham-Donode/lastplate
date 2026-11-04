"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Power, PowerOff } from "lucide-react";
import { setProfileActiveAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function AccountStatusControl({
  profileId,
  isActive,
  organizationName,
}: {
  profileId: string;
  isActive: boolean;
  organizationName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(nextActive: boolean) {
    setError(null);

    startTransition(async () => {
      const result = await setProfileActiveAction(profileId, nextActive);

      if (!result.ok) {
        setError(result.message);
      } else {
        setConfirming(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-1.5">
      {isActive ? (
        confirming ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => update(false)}
              disabled={isPending}
              aria-label={`Confirm disabling ${organizationName}`}
            >
              {isPending && (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
              )}
              Confirm disable
            </Button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={isPending}
              className="inline-flex h-9 items-center rounded-control px-2 text-[11.5px] font-medium text-muted transition-colors hover:bg-surface hover:text-ink disabled:pointer-events-none disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setConfirming(true)}
            aria-label={`Disable ${organizationName}`}
          >
            <PowerOff className="size-3.5" strokeWidth={1.8} />
            Disable
          </Button>
        )
      ) : (
        <Button
          size="sm"
          onClick={() => update(true)}
          disabled={isPending}
          aria-label={`Enable ${organizationName}`}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <Power className="size-3.5" strokeWidth={1.8} />
          )}
          Enable
        </Button>
      )}

      {error && (
        <p role="alert" className="text-[11px] leading-4 text-ink-soft">
          {error}
        </p>
      )}
    </div>
  );
}
