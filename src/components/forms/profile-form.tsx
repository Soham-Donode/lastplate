"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import type { Profile } from "@/types";
import { updateProfileAction } from "@/actions/donations";
import { ROLE_LABELS } from "@/lib/constants";
import { resolveCoordinates } from "@/lib/geo";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LocationPicker } from "@/components/map/location-picker";

const DONOR_ORGANIZATION_TYPES = [
  "Restaurant",
  "College hostel",
  "College mess",
  "Cafeteria",
  "Hotel",
  "Bakery",
  "Other food establishment",
];

const NGO_ORGANIZATION_TYPES = [
  "Food relief NGO",
  "Community kitchen",
  "Shelter",
  "Food bank",
  "Other non-profit",
];

export function ProfileForm({
  profile,
  demo,
}: {
  profile: Profile;
  demo: boolean;
}) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const centre = resolveCoordinates(
    profile.latitude,
    profile.longitude,
    profile.city,
  );
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      organizationName: profile.organizationName,
      organizationType: profile.organizationType,
      phone: profile.phone,
      city: profile.city,
      address: profile.address,
      latitude: centre.latitude,
      longitude: centre.longitude,
    },
  });

  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });

  const isNgo = profile.role === "ngo";
  const baseOrganizationTypes = isNgo
    ? NGO_ORGANIZATION_TYPES
    : DONOR_ORGANIZATION_TYPES;
  const organizationTypes = baseOrganizationTypes.includes(
    profile.organizationType,
  )
    ? baseOrganizationTypes
    : [profile.organizationType, ...baseOrganizationTypes];
  const verified = profile.verificationStatus === "verified";

  const onSubmit = handleSubmit(async (values) => {
    setSuccess(false);
    const result = await updateProfileAction(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof ProfileFormValues, {
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

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {success && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-card border border-green/15 bg-green-light px-4 py-3 text-[12.5px] text-green-dark"
        >
          <Check className="size-4" strokeWidth={2} />
          Organization profile updated.
        </div>
      )}

      {errors.root?.message && (
        <div
          role="alert"
          className="rounded-card border border-line bg-surface px-4 py-3 text-[12.5px] text-ink-soft"
        >
          {errors.root.message}
        </div>
      )}

      <Card className="p-5 sm:p-6">
        <h2 className="text-[15px] font-semibold text-ink">
          Organization details
        </h2>
        <p className="mt-1 text-[12px] leading-5 text-muted">
          {isNgo
            ? "This information is shown to donors when you request a collection."
            : "This information is shown to NGOs when they request a collection."}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field
            label="Contact person"
            htmlFor="fullName"
            error={errors.fullName?.message}
          >
            <Input
              id="fullName"
              autoComplete="name"
              aria-invalid={Boolean(errors.fullName)}
              {...register("fullName")}
            />
          </Field>

          <Field
            label="Organization name"
            htmlFor="organizationName"
            error={errors.organizationName?.message}
          >
            <Input
              id="organizationName"
              autoComplete="organization"
              aria-invalid={Boolean(errors.organizationName)}
              {...register("organizationName")}
            />
          </Field>

          <Field
            label="Organization type"
            htmlFor="organizationType"
            error={errors.organizationType?.message}
          >
            <Select id="organizationType" {...register("organizationType")}>
              {organizationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Phone number"
            htmlFor="phone"
            error={errors.phone?.message}
          >
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              {...register("phone")}
            />
          </Field>

          <Field label="City" htmlFor="city" error={errors.city?.message}>
            <Input
              id="city"
              autoComplete="address-level2"
              aria-invalid={Boolean(errors.city)}
              {...register("city")}
            />
          </Field>

          <Field
            label="Address"
            htmlFor="address"
            error={errors.address?.message}
            className="sm:col-span-2"
          >
            <Input
              id="address"
              autoComplete="street-address"
              aria-invalid={Boolean(errors.address)}
              {...register("address")}
            />
          </Field>

          <input
            type="hidden"
            {...register("latitude", { valueAsNumber: true })}
          />
          <input
            type="hidden"
            {...register("longitude", { valueAsNumber: true })}
          />

          <Field
            label="Organization location"
            error={errors.latitude?.message ?? errors.longitude?.message}
            hint={
              isNgo
                ? "This is the centre of the donation map on your dashboard."
                : "New donations start from this point on the map."
            }
            className="sm:col-span-2"
          >
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onChange={(nextLatitude, nextLongitude) => {
                setValue("latitude", nextLatitude, { shouldValidate: true });
                setValue("longitude", nextLongitude, { shouldValidate: true });
              }}
            />
          </Field>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-5">
          <p className="text-[11px] leading-4 text-muted">
            {demo
              ? "Demo workspace — changes are stored locally."
              : "Changes apply to future donation listings."}
          </p>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            )}
            Save changes
          </Button>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="text-[15px] font-semibold text-ink">Account</h2>
        <p className="mt-1 text-[12px] leading-5 text-muted">
          Sign-in details are managed by LastPlate and cannot be edited here.
        </p>

        <dl className="mt-4 divide-y divide-line">
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-[11.5px] text-muted">Email</dt>
            <dd className="text-[12px] font-medium text-ink">
              {profile.email}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-[11.5px] text-muted">Account type</dt>
            <dd className="text-[12px] font-medium text-ink">
              {ROLE_LABELS[profile.role]}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-[11.5px] text-muted">Verification</dt>
            <dd>
              <Badge tone={verified ? "green" : "outline"}>
                <span
                  className={
                    verified
                      ? "size-1.5 rounded-full bg-green"
                      : "size-1.5 rounded-full bg-muted"
                  }
                />
                {verified
                  ? `Verified ${isNgo ? "NGO" : "donor"}`
                  : profile.verificationStatus === "rejected"
                    ? "Verification rejected"
                    : "Verification pending"}
              </Badge>
            </dd>
          </div>
          {isNgo && (
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="text-[11.5px] text-muted">Registration no.</dt>
              <dd className="max-w-[60%] text-right text-[12px] font-medium text-ink">
                {profile.registrationNumber ?? "Not provided"}
              </dd>
            </div>
          )}
          {isNgo && profile.verificationNotes && (
            <div className="flex items-start justify-between gap-4 py-3">
              <dt className="text-[11.5px] text-muted">Verification notes</dt>
              <dd className="max-w-[60%] text-right text-[12px] leading-5 text-secondary">
                {profile.verificationNotes}
              </dd>
            </div>
          )}
        </dl>
      </Card>
    </form>
  );
}
