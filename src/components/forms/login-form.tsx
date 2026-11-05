"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import { signInAction } from "@/actions/auth";
import {
  signInSchema,
  type SignInFormValues,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [serverError, setServerError] = useState<string | null>(
    initialError ?? null,
  );
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signInAction(values);
      if (!result.ok) setServerError(result.message);
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <h1 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[34px]">
          Welcome back
        </h1>
        <p className="mt-2 text-[13px] leading-6 text-muted">
          New to LastPlate?{" "}
          <Link
            href="/register"
            className="font-medium text-accent-ink hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="glass-well rounded-control px-3 py-2.5 text-[12px] leading-5 text-ink-soft"
        >
          {serverError}
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

      <Field
        label="Password"
        htmlFor="password"
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          fieldSize="lg"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </Field>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-[11.5px] text-muted transition-colors hover:text-ink"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-[10px] text-[14px]"
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <LogIn className="size-4" strokeWidth={1.8} />
        )}
        Sign in
      </Button>
    </form>
  );
}
