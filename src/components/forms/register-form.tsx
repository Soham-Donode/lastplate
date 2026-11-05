"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, CheckCircle2, HeartHandshake, Loader2 } from "lucide-react";
import { registerAction } from "@/actions/auth";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations";
import { organizationTypesForRole } from "@/lib/constants";
import { Button, buttonStyles } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";

export function RegisterForm({
  defaultRole = "donor",
}: {
  defaultRole?: "donor" | "ngo";
}) {
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: defaultRole,
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      organizationName: "",
      organizationType: "",
      phone: "",
      city: "",
      address: "",
      registrationNumber: "",
      verificationNotes: "",
      termsAccepted: false,
    },
  });

  const role = useWatch({ control, name: "role" });
  const isNgo = role === "ngo";
  const organizationTypes = organizationTypesForRole(role);

  function chooseRole(nextRole: "donor" | "ngo") {
    setValue("role", nextRole, { shouldValidate: true });
    setValue("organizationType", "", { shouldValidate: false });
  }

  const onSubmit = handleSubmit(async (values) => {
    const result = await registerAction(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof RegisterFormValues, {
              type: "server",
              message: messages[0],
            });
          }
        }
      }

      setError("root", { type: "server", message: result.message });
      return;
    }

    setCreatedEmail(values.email);
  });

  if (createdEmail) {
    return (
      <div>
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent-strong">
          <CheckCircle2 className="size-5" strokeWidth={1.8} />
        </span>
        <h1 className="mt-4 text-[22px] font-semibold tracking-[-0.03em] text-ink">
          Check your email
        </h1>
        <p className="mt-2 text-[12.5px] leading-5 text-muted">
          We sent a confirmation link to{" "}
          <span className="font-medium text-ink">{createdEmail}</span>. Open it
          to activate your LastPlate account, then sign in.
        </p>
        {isNgo && (
          <p className="mt-3 glass-well rounded-control px-3 py-2.5 text-[12px] leading-5 text-secondary">
            NGO accounts are reviewed by the LastPlate team after confirmation.
            You can sign in right away, but donation requests unlock once your
            organization is verified.
          </p>
        )}
        <Link
          href="/login"
          className={buttonStyles({ className: "mt-5 w-full" })}
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <h1 className="text-[30px] font-semibold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[34px]">
          Create your account
        </h1>
        <p className="mt-2 text-[13px] leading-6 text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-accent-ink hover:underline"
          >
            Sign in
          </Link>
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

      <fieldset>
        <legend className="text-[13px] font-medium text-ink">
          How will you use LastPlate?
        </legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <RoleOption
            active={role === "donor"}
            icon={Building2}
            title="I have surplus food"
            description="Restaurant, hostel, mess, or cafeteria"
            onClick={() => chooseRole("donor")}
          />
          <RoleOption
            active={role === "ngo"}
            icon={HeartHandshake}
            title="I collect food"
            description="NGO, trust, or community kitchen"
            onClick={() => chooseRole("ngo")}
          />
        </div>
        {errors.role?.message && (
          <p className="mt-1.5 text-[12px] text-ink-soft" role="alert">
            {errors.role.message}
          </p>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Contact person"
          htmlFor="fullName"
          error={errors.fullName?.message}
        >
          <Input fieldSize="lg"
            id="fullName"
            autoComplete="name"
            placeholder="Ananya Rao"
            aria-invalid={Boolean(errors.fullName)}
            {...register("fullName")}
          />
        </Field>

        <Field
          label="Work phone"
          htmlFor="phone"
          error={errors.phone?.message}
        >
          <Input fieldSize="lg"
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91 80 4123 8890"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </Field>

        <Field
          label="Organization name"
          htmlFor="organizationName"
          error={errors.organizationName?.message}
          className="sm:col-span-2"
        >
          <Input fieldSize="lg"
            id="organizationName"
            autoComplete="organization"
            placeholder={isNgo ? "Annapurna Trust" : "Saffron Kitchen"}
            aria-invalid={Boolean(errors.organizationName)}
            {...register("organizationName")}
          />
        </Field>

        <Field
          label="Organization type"
          htmlFor="organizationType"
          error={errors.organizationType?.message}
        >
          <Select
            id="organizationType"
            aria-invalid={Boolean(errors.organizationType)}
            {...register("organizationType")}
          >
            <option value="">Select a type</option>
            {organizationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="City" htmlFor="city" error={errors.city?.message}>
          <Input fieldSize="lg"
            id="city"
            autoComplete="address-level2"
            placeholder="Bengaluru"
            aria-invalid={Boolean(errors.city)}
            {...register("city")}
          />
        </Field>

        <Field
          label="Full address"
          htmlFor="address"
          error={errors.address?.message}
          className="sm:col-span-2"
        >
          <Input fieldSize="lg"
            id="address"
            autoComplete="street-address"
            placeholder="14, 5th Cross, Indiranagar"
            aria-invalid={Boolean(errors.address)}
            {...register("address")}
          />
        </Field>
      </div>

      {isNgo && (
        <div className="glass-well rounded-card p-4">
          <h2 className="text-[13px] font-medium text-ink">
            NGO verification details
          </h2>
          <p className="mt-1 text-[11.5px] leading-5 text-muted">
            Admins review these details before your organization can request
            food collections. They are never shown to donors.
          </p>
          <div className="mt-3 grid gap-4">
            <Field
              label="Registration or licence number"
              htmlFor="registrationNumber"
              error={errors.registrationNumber?.message}
            >
              <Input fieldSize="lg"
                id="registrationNumber"
                placeholder="e.g. NGO/KA/2019/0142"
                aria-invalid={Boolean(errors.registrationNumber)}
                {...register("registrationNumber")}
              />
            </Field>
            <Field
              label="Verification notes"
              htmlFor="verificationNotes"
              optional
              error={errors.verificationNotes?.message}
              hint="Registration authority, website, or a reference we can contact."
            >
              <Textarea fieldSize="lg"
                id="verificationNotes"
                rows={2}
                placeholder="Registered with the Karnataka Societies Registrar. Reference available on request."
                {...register("verificationNotes")}
              />
            </Field>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Email"
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input fieldSize="lg"
            id="email"
            type="email"
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
          hint="At least 8 characters."
        >
          <Input fieldSize="lg"
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>

        <Field
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          className="sm:col-span-2"
        >
          <Input fieldSize="lg"
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
        </Field>
      </div>

      <label className="flex items-start gap-2.5 text-[12px] leading-5 text-secondary">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 rounded-xs border-line accent-accent"
          aria-invalid={Boolean(errors.termsAccepted)}
          {...register("termsAccepted")}
        />
        <span>
          I agree to follow applicable food-safety rules and to use LastPlate
          only for edible, safely handled food.
        </span>
      </label>
      {errors.termsAccepted?.message && (
        <p className="text-[12px] leading-5 text-ink-soft" role="alert">
          {errors.termsAccepted.message}
        </p>
      )}

      <Button
        type="submit"
        className="h-12 w-full rounded-[10px] text-[14px]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={2} />
        ) : (
          <HeartHandshake className="size-4" strokeWidth={1.8} />
        )}
        Create account
      </Button>
    </form>
  );
}

function RoleOption({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: typeof Building2;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-[10px] border p-4 text-left transition-colors ${
        active
          ? "border-accent-strong bg-accent-soft"
          : "border-transparent bg-surface hover:bg-subtle"
      }`}
    >
      <Icon
        className={`size-4 ${active ? "text-accent-strong" : "text-muted"}`}
        strokeWidth={1.8}
      />
      <span className="mt-2 block text-[12.5px] font-medium text-ink">
        {title}
      </span>
      <span className="mt-0.5 block text-[11px] leading-4 text-muted">
        {description}
      </span>
    </button>
  );
}
