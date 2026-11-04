"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { ROLE_HOME } from "@/lib/constants";
import { getDonorRepository, isDemoMode } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  signInSchema,
  type ForgotPasswordFormValues,
  type RegisterFormValues,
  type ResetPasswordFormValues,
  type SignInFormValues,
} from "@/lib/validations";

type FieldErrors = Record<string, string[]>;

export type SignInResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export type RegisterResult =
  | { ok: true; requiresEmailConfirmation: boolean }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

export type AuthMessageResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: FieldErrors };

async function requestOrigin() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

function firstMessage(message: string) {
  return message.length > 180 ? `${message.slice(0, 177)}…` : message;
}

export async function signInAction(
  values: SignInFormValues,
): Promise<SignInResult> {
  if (isDemoMode) {
    return { ok: true };
  }

  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return {
      ok: false,
      message: "That email and password combination did not work.",
    };
  }

  const profile = await getDonorRepository().getProfile(data.user.id);
  if (!profile) {
    return {
      ok: false,
      message:
        "Your account is missing a profile. Contact the LastPlate team for help.",
    };
  }

  if (!profile.isActive) {
    await supabase.auth.signOut();
    return {
      ok: false,
      message:
        "This account has been disabled. Contact the LastPlate team if you think this is a mistake.",
    };
  }

  redirect(ROLE_HOME[profile.role]);
}

export async function registerAction(
  values: RegisterFormValues,
): Promise<RegisterResult> {
  if (isDemoMode) {
    return {
      ok: false,
      message:
        "Registration needs a Supabase project. Add credentials to .env.local to create real accounts.",
    };
  }

  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { password, role, ...profile } = parsed.data;
  const origin = await requestOrigin();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signUp({
    email: profile.email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
        ROLE_HOME[role],
      )}`,
      data: {
        role,
        full_name: profile.fullName,
        organization_name: profile.organizationName,
        organization_type: profile.organizationType,
        phone: profile.phone,
        city: profile.city,
        address: profile.address,
        registration_number: profile.registrationNumber ?? "",
        verification_notes: profile.verificationNotes ?? "",
      },
    },
  });

  if (error) {
    return {
      ok: false,
      message:
        error.code === "user_already_exists"
          ? "An account already exists for this email. Try signing in instead."
          : firstMessage(error.message),
    };
  }

  if (data.session) {
    redirect(ROLE_HOME[role]);
  }

  return { ok: true, requiresEmailConfirmation: true };
}

export async function requestPasswordResetAction(
  values: ForgotPasswordFormValues,
): Promise<AuthMessageResult> {
  if (isDemoMode) {
    return {
      ok: false,
      message:
        "Password reset needs a Supabase project. Add credentials to .env.local to enable it.",
    };
  }

  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Enter a valid email address.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const origin = await requestOrigin();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    },
  );

  if (error && error.code === "over_email_send_rate_limit") {
    return {
      ok: false,
      message: "Too many reset emails were requested. Try again in a few minutes.",
    };
  }

  // Do not reveal whether an account exists for this address.
  return {
    ok: true,
    message:
      "If an account exists for that email, a password reset link is on its way.",
  };
}

export async function updatePasswordAction(
  values: ResetPasswordFormValues,
): Promise<AuthMessageResult> {
  if (isDemoMode) {
    return {
      ok: false,
      message:
        "Password reset needs a Supabase project. Add credentials to .env.local to enable it.",
    };
  }

  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Check the details below and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message:
        "Your reset link has expired or was already used. Request a new link.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, message: firstMessage(error.message) };
  }

  const profile = await getDonorRepository().getProfile(user.id);
  revalidatePath("/", "layout");
  redirect(profile ? ROLE_HOME[profile.role] : "/login");
}

export async function signOutAction() {
  if (!isDemoMode) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
