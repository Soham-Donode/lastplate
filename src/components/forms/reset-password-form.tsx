"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
import { updatePasswordAction } from "@/actions/auth";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function ResetPasswordForm({ email }: { email: string }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await updatePasswordAction(values);
    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof ResetPasswordFormValues, {
              type: "server",
              message: messages[0],
            });
          }
        }
      }
      setError("root", { type: "server", message: result.message });
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <h1 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[34px]">
          Choose a new password
        </h1>
        <p className="mt-2 text-[13px] leading-6 text-muted">
          You are resetting the password for{" "}
          <span className="font-medium text-ink">{email}</span>.
        </p>
      </div>

      {errors.root?.message && (
        <div
          role="alert"
          className="glass-well rounded-control px-3 py-2.5 text-[12px] leading-5 text-ink-soft"
        >
          {errors.root.message}
        </div>
      )}

      <Field
        label="New password"
        htmlFor="password"
        error={errors.password?.message}
        hint="At least 8 characters."
      >
        <Input
          id="password"
          type="password"
          fieldSize="lg"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </Field>

      <Field
        label="Confirm new password"
        htmlFor="confirmPassword"
        error={errors.confirmPassword?.message}
      >
        <Input
          id="confirmPassword"
          type="password"
          fieldSize="lg"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
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
          <KeyRound className="size-4" strokeWidth={1.8} />
        )}
        Update password
      </Button>

      <p className="text-center text-[11px] leading-4 text-muted">
        Need a new link?{" "}
        <Link
          href="/forgot-password"
          className="font-medium text-ink hover:underline"
        >
          Request another
        </Link>
      </p>
    </form>
  );
}
