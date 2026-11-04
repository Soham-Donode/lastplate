"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { requestPasswordResetAction } from "@/actions/auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function ForgotPasswordForm({ notice }: { notice?: string }) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await requestPasswordResetAction(values);

    if (!result.ok) {
      if (result.fieldErrors?.email?.[0]) {
        setError("email", {
          type: "server",
          message: result.fieldErrors.email[0],
        });
      }
      setError("root", { type: "server", message: result.message });
      return;
    }

    setSentTo(values.email);
  });

  if (sentTo) {
    return (
      <div>
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-green-light text-green-dark">
          <CheckCircle2 className="size-5" strokeWidth={1.8} />
        </span>
        <h1 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[34px]">
          Check your inbox
        </h1>
        <p className="mt-2 text-[12.5px] leading-5 text-muted">
          If an account exists for{" "}
          <span className="font-medium text-ink">{sentTo}</span>, a password
          reset link is on its way. The link expires after one use.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-[10px] border border-line bg-paper px-4 text-sm font-medium text-ink transition-colors hover:bg-surface"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <h1 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[34px]">
          Reset your password
        </h1>
        <p className="mt-2 text-[13px] leading-6 text-muted">
          Enter the email for your organization account and we will send a
          secure reset link.
        </p>
      </div>

      {notice && (
        <div className="rounded-control border border-line bg-surface px-3 py-2.5 text-[12px] leading-5 text-ink-soft">
          {notice}
        </div>
      )}

      {errors.root?.message && (
        <div
          role="alert"
          className="rounded-control border border-line bg-surface px-3 py-2.5 text-[12px] leading-5 text-ink-soft"
        >
          {errors.root.message}
        </div>
      )}

      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          fieldSize="lg"
          autoComplete="email"
          placeholder="you@organization.org"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>

      <Button
        type="submit"
        className="h-12 w-full rounded-[10px] text-[14px]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <Mail className="size-4" strokeWidth={1.8} />
        )}
        Send reset link
      </Button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-[11.5px] text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.8} />
        Back to sign in
      </Link>
    </form>
  );
}
