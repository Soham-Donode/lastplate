import { z } from "zod";
import { zonedDateTimeToIso } from "@/lib/utils";

export const donationFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(4, "Give the donation a clear title.")
      .max(120, "Keep the title under 120 characters."),
    description: z
      .string()
      .trim()
      .min(20, "Describe the food in at least 20 characters.")
      .max(2000, "Keep the description under 2000 characters."),
    category: z.enum([
      "cooked_meals",
      "rice_grains",
      "bread_bakery",
      "fruits",
      "vegetables",
      "packaged_food",
      "other",
    ]),
    foodType: z.enum(["vegetarian", "non_vegetarian"]),
    quantity: z
      .number("Enter the available quantity.")
      .positive("Quantity must be greater than zero.")
      .max(100000, "That quantity looks too large."),
    quantityUnit: z.enum(["kg", "meals", "packs", "litres"]),
    allergens: z
      .string()
      .trim()
      .max(300, "Keep allergen information under 300 characters.")
      .optional(),
    preparedAt: z.string().min(1, "Add the preparation time."),
    safeUntil: z.string().min(1, "Add a safe-consumption deadline."),
    pickupDeadline: z.string().min(1, "Add a pickup deadline."),
    pickupAddress: z
      .string()
      .trim()
      .min(10, "Add the full pickup address.")
      .max(500, "Keep the address under 500 characters."),
    city: z
      .string()
      .trim()
      .min(2, "Add the city.")
      .max(80, "Keep the city name under 80 characters."),
    latitude: z
      .number("Pick the pickup location on the map.")
      .min(-90, "Pick a valid location on the map.")
      .max(90, "Pick a valid location on the map."),
    longitude: z
      .number("Pick the pickup location on the map.")
      .min(-180, "Pick a valid location on the map.")
      .max(180, "Pick a valid location on the map."),
    additionalInstructions: z
      .string()
      .trim()
      .max(1000, "Keep instructions under 1000 characters.")
      .optional(),
    imageUrl: z.string().trim().max(2000).optional(),
    foodSafetyConfirmed: z
      .boolean()
      .refine((value) => value, {
        message: "Confirm that the food is suitable for donation.",
      }),
  })
  .superRefine((value, ctx) => {
    const prepared = new Date(zonedDateTimeToIso(value.preparedAt));
    const safe = new Date(zonedDateTimeToIso(value.safeUntil));
    const pickup = new Date(zonedDateTimeToIso(value.pickupDeadline));
    const now = new Date();

    if (prepared.getTime() > now.getTime() + 30 * 60 * 1000) {
      ctx.addIssue({
        code: "custom",
        path: ["preparedAt"],
        message: "Preparation time cannot be in the future.",
      });
    }

    if (safe.getTime() <= prepared.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["safeUntil"],
        message: "Safe-consumption deadline must be after preparation.",
      });
    }

    if (safe.getTime() <= now.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["safeUntil"],
        message: "Safe-consumption deadline must be in the future.",
      });
    }

    if (pickup.getTime() > safe.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["pickupDeadline"],
        message: "Pickup must happen before the safe-consumption deadline.",
      });
    }

    if (pickup.getTime() <= now.getTime()) {
      ctx.addIssue({
        code: "custom",
        path: ["pickupDeadline"],
        message: "Pickup deadline must be in the future.",
      });
    }
  });

export type DonationFormValues = z.infer<typeof donationFormSchema>;

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Add the contact person's name.")
    .max(120, "Keep the name under 120 characters."),
  organizationName: z
    .string()
    .trim()
    .min(2, "Add your organization's name.")
    .max(160, "Keep the name under 160 characters."),
  organizationType: z
    .string()
    .trim()
    .min(2, "Add the organization type.")
    .max(80, "Keep the type under 80 characters."),
  phone: z
    .string()
    .trim()
    .min(8, "Add a contact number.")
    .max(20, "Keep the number under 20 characters.")
    .regex(/^[+\d][\d\s-]{6,}$/, "Use a valid phone number."),
  city: z.string().trim().min(2, "Add the city.").max(80),
  address: z
    .string()
    .trim()
    .min(10, "Add the full address.")
    .max(500, "Keep the address under 500 characters."),
  latitude: z
    .number("Pick your organization location on the map.")
    .min(-90, "Pick a valid location on the map.")
    .max(90, "Pick a valid location on the map."),
  longitude: z
    .number("Pick your organization location on the map.")
    .min(-180, "Pick a valid location on the map.")
    .max(180, "Pick a valid location on the map."),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export const collectionRequestSchema = z.object({
  donationId: z.uuid("That donation could not be found."),
  requestedQuantity: z
    .number("Enter the quantity you can collect.")
    .positive("Quantity must be greater than zero.")
    .max(100000, "That quantity looks too large."),
  message: z
    .string()
    .trim()
    .max(500, "Keep your message under 500 characters.")
    .optional(),
});

export type CollectionRequestFormValues = z.infer<
  typeof collectionRequestSchema
>;

export const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Keep the password under 72 characters.");

export const registerSchema = z
  .object({
    role: z.enum(["donor", "ngo"], {
      message: "Choose whether you are donating or collecting food.",
    }),
    fullName: z
      .string()
      .trim()
      .min(2, "Add the contact person's name.")
      .max(120, "Keep the name under 120 characters."),
    email: z.email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string(),
    organizationName: z
      .string()
      .trim()
      .min(2, "Add your organization's name.")
      .max(160, "Keep the name under 160 characters."),
    organizationType: z
      .string()
      .trim()
      .min(2, "Choose an organization type.")
      .max(80, "Keep the type under 80 characters."),
    phone: z
      .string()
      .trim()
      .min(8, "Add a contact number.")
      .max(20, "Keep the number under 20 characters.")
      .regex(/^[+\d][\d\s-]{6,}$/, "Use a valid phone number."),
    city: z.string().trim().min(2, "Add the city.").max(80),
    address: z
      .string()
      .trim()
      .min(10, "Add the full address.")
      .max(500, "Keep the address under 500 characters."),
    registrationNumber: z
      .string()
      .trim()
      .max(80, "Keep the registration number under 80 characters.")
      .optional(),
    verificationNotes: z
      .string()
      .trim()
      .max(500, "Keep verification notes under 500 characters.")
      .optional(),
    termsAccepted: z.boolean().refine((value) => value, {
      message: "Accept the platform terms to continue.",
    }),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }

    if (value.role === "ngo" && !value.registrationNumber) {
      ctx.addIssue({
        code: "custom",
        path: ["registrationNumber"],
        message: "Add your NGO registration or licence number.",
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ngoVerificationSchema = z.object({
  ngoId: z.uuid("That NGO could not be found."),
  status: z.enum(["pending", "verified", "rejected"]),
});

export type NgoVerificationValues = z.infer<typeof ngoVerificationSchema>;

export const profileActiveSchema = z.object({
  profileId: z.uuid("That account could not be found."),
  isActive: z.boolean(),
});

export type ProfileActiveValues = z.infer<typeof profileActiveSchema>;
