"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, PackageCheck } from "lucide-react";
import { confirmCollectionAction } from "@/actions/ngo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export function ConfirmCollectionButton({
  donationId,
}: {
  donationId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await confirmCollectionAction(donationId, notes);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <PackageCheck className="size-4" strokeWidth={1.8} />
        Confirm collection
      </Button>
    );
  }

  return (
    <div className="w-full rounded-card border border-line bg-paper p-4 text-left">
      <p className="text-[12.5px] font-medium text-ink">
        Confirm this collection
      </p>
      <p className="mt-1 text-[11.5px] leading-4 text-muted">
        Only confirm after your team has collected the food. This records the
        pickup and closes the request.
      </p>
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Optional collection notes"
        className="mt-3 min-h-20 text-[12.5px]"
        maxLength={500}
        aria-label="Collection notes"
      />
      {error && (
        <p className="mt-2 text-[11.5px] leading-4 text-ink-soft" role="alert">
          {error}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={confirm} disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <Check className="size-3.5" strokeWidth={2} />
          )}
          Confirm collected
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
