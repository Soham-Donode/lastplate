/**
 * Supabase now issues publishable keys (`sb_publishable_…`) alongside the
 * legacy anon JWT keys. Both are safe to expose to the browser, so either
 * variable can be used.
 */
export function supabasePublicKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    ""
  );
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && supabasePublicKey());
}

/**
 * When Supabase credentials are absent the app falls back to a local,
 * file-backed demo workspace. The UI labels this state clearly.
 */
export const isDemoMode = !isSupabaseConfigured();

export function supabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  return url;
}

export function supabaseAnonKey() {
  const key = supabasePublicKey();
  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured.",
    );
  }
  return key;
}
