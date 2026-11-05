"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import type { Profile } from "@/types";
import { createDonationAction } from "@/actions/donations";
import {
  donationFormSchema,
  type DonationFormValues,
} from "@/lib/validations";
import { FOOD_CATEGORIES, QUANTITY_UNITS } from "@/lib/constants";
import { toDateTimeLocalValue } from "@/lib/utils";
import { resolveCoordinates } from "@/lib/geo";
import { Button, buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/page-header";
import { LocationPicker } from "@/components/map/location-picker";
import { ImageUploader } from "./image-uploader";

function inHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="pb-5">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-[12px] leading-5 text-muted">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

export function DonationForm({
  profile,
}: {
  profile: Pick<Profile, "city" | "address" | "latitude" | "longitude">;
}) {
  const router = useRouter();
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
  } = useForm<DonationFormValues>({
    resolver: zodResolver(donationFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "cooked_meals",
      foodType: "vegetarian",
      quantity: 5,
      quantityUnit: "kg",
      allergens: "",
      preparedAt: toDateTimeLocalValue(new Date()),
      safeUntil: toDateTimeLocalValue(inHours(6)),
      pickupDeadline: toDateTimeLocalValue(inHours(5)),
      pickupAddress: profile.address,
      city: profile.city,
      latitude: centre.latitude,
      longitude: centre.longitude,
      additionalInstructions: "",
      imageUrl: "",
      foodSafetyConfirmed: false,
    },
  });

  const foodType = useWatch({ control, name: "foodType" });
  const imageUrl = useWatch({ control, name: "imageUrl" });
  const latitude = useWatch({ control, name: "latitude" });
  const longitude = useWatch({ control, name: "longitude" });

  const onSubmit = handleSubmit(async (values) => {
    const result = await createDonationAction(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof DonationFormValues, {
              type: "server",
              message: messages[0],
            });
          }
        }
      }

      setError("root", { type: "server", message: result.message });
      return;
    }

    router.push(`/donor/donations/${result.id}`);
    router.refresh();
  });

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-3">
        <Link
          href="/donor/donations"
          className="inline-flex items-center gap-1.5 rounded-control text-[12px] text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.8} />
          Back to donations
        </Link>
      </div>

      <PageHeader
        title="Create a donation"
        description="Share surplus food with a verified NGO nearby. Your listing stays visible until it is collected or reaches its safe-consumption deadline."
      />

      <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
        {errors.root?.message && (
          <div
            role="alert"
            className="glass-well rounded-card px-4 py-3 text-[12.5px] leading-5 text-ink-soft"
          >
            {errors.root.message}
          </div>
        )}

        <Section
          title="Food information"
          description="Tell NGOs exactly what is available and how much there is."
        >
          <Field
            label="Food title"
            htmlFor="title"
            error={errors.title?.message}
            className="sm:col-span-2"
          >
            <Input
              id="title"
              placeholder="e.g. Vegetable pulao with raita"
              maxLength={120}
              aria-invalid={Boolean(errors.title)}
              {...register("title")}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="description"
            error={errors.description?.message}
            hint="Mention how it was prepared and packed. Do not include personal contact details."
            className="sm:col-span-2"
          >
            <Textarea
              id="description"
              placeholder="Describe the food, how it was prepared, and how it is packed."
              rows={4}
              maxLength={2000}
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
          </Field>

          <Field
            label="Category"
            htmlFor="category"
            error={errors.category?.message}
          >
            <Select id="category" {...register("category")}>
              {FOOD_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Food type" error={errors.foodType?.message}>
            <div className="grid grid-cols-2 gap-2" role="radiogroup">
              {[
                { value: "vegetarian", label: "Vegetarian" },
                { value: "non_vegetarian", label: "Non-vegetarian" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={
                    foodType === option.value
                      ? "flex h-10 cursor-pointer items-center justify-center rounded-control border border-accent-strong bg-accent-soft px-3 text-[13px] font-medium text-accent-strong has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/25"
                      : "flex h-10 cursor-pointer items-center justify-center rounded-control border border-line/70 bg-paper px-3 text-[13px] text-secondary transition-colors hover:bg-surface has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent/25"
                  }
                >
                  <input
                    type="radio"
                    value={option.value}
                    className="sr-only"
                    {...register("foodType")}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </Field>

          <Field
            label="Quantity"
            htmlFor="quantity"
            error={errors.quantity?.message}
          >
            <Input
              id="quantity"
              type="number"
              inputMode="decimal"
              min="0.1"
              step="0.1"
              aria-invalid={Boolean(errors.quantity)}
              {...register("quantity", { valueAsNumber: true })}
            />
          </Field>

          <Field label="Unit" htmlFor="quantityUnit">
            <Select id="quantityUnit" {...register("quantityUnit")}>
              {QUANTITY_UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Allergens"
            htmlFor="allergens"
            optional
            error={errors.allergens?.message}
            hint="List known allergens such as milk, nuts or gluten."
            className="sm:col-span-2"
          >
            <Input
              id="allergens"
              placeholder="e.g. Milk, gluten, mustard"
              maxLength={300}
              {...register("allergens")}
            />
          </Field>
        </Section>

        <Section
          title="Food safety"
          description="LastPlate coordinates collections — it does not certify food safety."
        >
          <Field
            label="Prepared at"
            htmlFor="preparedAt"
            error={errors.preparedAt?.message}
          >
            <Input
              id="preparedAt"
              type="datetime-local"
              aria-invalid={Boolean(errors.preparedAt)}
              {...register("preparedAt")}
            />
          </Field>

          <Field
            label="Safe until"
            htmlFor="safeUntil"
            error={errors.safeUntil?.message}
            hint="The food must not be collected after this time."
          >
            <Input
              id="safeUntil"
              type="datetime-local"
              aria-invalid={Boolean(errors.safeUntil)}
              {...register("safeUntil")}
            />
          </Field>

          <label className="flex cursor-pointer items-start gap-3 glass-well rounded-control p-4 sm:col-span-2">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 accent-[#2f7d9f]"
              {...register("foodSafetyConfirmed")}
            />
            <span>
              <span className="block text-[12.5px] font-medium text-ink">
                I confirm this food is suitable for donation
              </span>
              <span className="mt-0.5 block text-[11.5px] leading-4 text-muted">
                It has been stored safely, is within its safe-consumption
                window, and follows applicable local food-safety rules.
              </span>
              {errors.foodSafetyConfirmed?.message && (
                <span
                  className="mt-1 block text-[11.5px] leading-4 text-ink-soft"
                  role="alert"
                >
                  {errors.foodSafetyConfirmed.message}
                </span>
              )}
            </span>
          </label>
        </Section>

        <Section
          title="Pickup information"
          description="Make it easy for the assigned NGO to find you and arrive on time."
        >
          <Field
            label="Pickup address"
            htmlFor="pickupAddress"
            error={errors.pickupAddress?.message}
            className="sm:col-span-2"
          >
            <Textarea
              id="pickupAddress"
              rows={2}
              maxLength={500}
              aria-invalid={Boolean(errors.pickupAddress)}
              {...register("pickupAddress")}
            />
          </Field>

          <Field label="City" htmlFor="city" error={errors.city?.message}>
            <Input
              id="city"
              maxLength={80}
              aria-invalid={Boolean(errors.city)}
              {...register("city")}
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
            label="Pickup point"
            error={errors.latitude?.message ?? errors.longitude?.message}
            hint="NGOs use this point to find your kitchen. Drag the pin to the exact entrance."
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

          <Field
            label="Pickup deadline"
            htmlFor="pickupDeadline"
            error={errors.pickupDeadline?.message}
            hint="Must be before the safe-consumption deadline."
          >
            <Input
              id="pickupDeadline"
              type="datetime-local"
              aria-invalid={Boolean(errors.pickupDeadline)}
              {...register("pickupDeadline")}
            />
          </Field>

          <Field
            label="Additional instructions"
            htmlFor="additionalInstructions"
            optional
            error={errors.additionalInstructions?.message}
            hint="Gate numbers, service entrances, containers to bring."
            className="sm:col-span-2"
          >
            <Textarea
              id="additionalInstructions"
              rows={3}
              maxLength={1000}
              {...register("additionalInstructions")}
            />
          </Field>
        </Section>

        <Section
          title="Photo"
          description="A clear photo helps NGOs understand what is available."
        >
          <div className="sm:col-span-2">
            <ImageUploader
              value={imageUrl || undefined}
              onChange={(url) => setValue("imageUrl", url ?? "")}
            />
          </div>
        </Section>

        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-1.5 text-[11px] leading-4 text-muted">
            <ShieldCheck
              className="mt-0.5 size-3.5 shrink-0 text-accent-ink"
              strokeWidth={2}
            />
            Only publish food you would be comfortable serving yourself.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/donor/donations"
              className={buttonStyles({ variant: "secondary" })}
            >
              Cancel
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="size-4 animate-spin" strokeWidth={2} />
              )}
              Publish donation
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
