"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Send } from "lucide-react";
import { createCollectionRequestAction } from "@/actions/ngo";
import {
  collectionRequestSchema,
  type CollectionRequestFormValues,
} from "@/lib/validations";
import { formatQuantity } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

export function CollectionRequestForm({
  donationId,
  availableQuantity,
  unit,
}: {
  donationId: string;
  availableQuantity: number;
  unit: string;
}) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CollectionRequestFormValues>({
    resolver: zodResolver(collectionRequestSchema),
    defaultValues: {
      donationId,
      requestedQuantity: availableQuantity,
      message: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSuccess(false);
    const result = await createCollectionRequestAction(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof CollectionRequestFormValues, {
              type: "server",
              message: messages[0],
            });
          }
        }
      }

      setError("root", { type: "server", message: result.message });
      return;
    }

    setSuccess(true);
    router.refresh();
  });

  if (success) {
    return (
      <div className="rounded-control border border-accent/15 bg-accent-soft p-4">
        <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-accent-strong">
          <Check className="size-4" strokeWidth={2} />
          Request sent
        </p>
        <p className="mt-1.5 text-[11.5px] leading-5 text-accent-strong/85">
          The donor will review your request. You can follow its status from
          your requests page.
        </p>
        <Button
          size="sm"
          variant="secondary"
          className="mt-3"
          onClick={() => router.push("/ngo/requests")}
        >
          View my requests
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {errors.root?.message && (
        <div
          role="alert"
          className="glass-well rounded-control px-3 py-2.5 text-[11.5px] leading-5 text-ink-soft"
        >
          {errors.root.message}
        </div>
      )}

      <Field
        label="Quantity you can collect"
        htmlFor="requestedQuantity"
        error={errors.requestedQuantity?.message}
        hint={`Up to ${formatQuantity(availableQuantity, unit)} is available.`}
      >
        <Input
          id="requestedQuantity"
          type="number"
          inputMode="decimal"
          min="0.5"
          max={availableQuantity}
          step="0.5"
          aria-invalid={Boolean(errors.requestedQuantity)}
          {...register("requestedQuantity", { valueAsNumber: true })}
        />
      </Field>

      <Field
        label="Message to the donor"
        htmlFor="message"
        error={errors.message?.message}
        hint="Optional. Share your pickup plan or distribution details."
      >
        <Textarea
          id="message"
          rows={3}
          maxLength={500}
          placeholder="We can collect by 6 pm and serve around 80 people."
          aria-invalid={Boolean(errors.message)}
          {...register("message")}
        />
      </Field>

      <p className="glass-well rounded-control px-3 py-2.5 text-[11px] leading-4 text-muted">
        Only request food you can collect and distribute before the pickup and
        safe-consumption deadlines. The donor confirms one NGO per donation.
      </p>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <Send className="size-4" strokeWidth={1.8} />
        )}
        Send collection request
      </Button>
    </form>
  );
}
