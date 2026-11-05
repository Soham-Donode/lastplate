"use client";

import { useLayoutEffect } from "react";

const STORAGE_KEY = "lastplate-theme";

/**
 * Applies the stored theme before the first paint after hydration. Keeping this
 * in a client component avoids rendering a raw <script> inside the React tree
 * while preserving the saved light/dark preference.
 */
export function ThemeInitializer() {
  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const dark =
        stored === "dark" ||
        (stored === null &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      document.documentElement.classList.toggle("dark", dark);
    } catch {
      // Storage can be unavailable in private browsing; light theme is the fallback.
    }
  }, []);

  return null;
}
