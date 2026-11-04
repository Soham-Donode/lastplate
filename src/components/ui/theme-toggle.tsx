"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "lastplate-theme";

export function ThemeToggle({ className }: { className?: string }) {
  function toggleTheme() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);

    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // Storage can be unavailable in private browsing; the toggle still works.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title="Toggle dark mode"
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-line bg-paper text-secondary transition-colors hover:bg-surface hover:text-ink",
        className,
      )}
    >
      <Sun
        aria-hidden="true"
        className="hidden size-[18px] dark:block"
        strokeWidth={1.8}
      />
      <Moon
        aria-hidden="true"
        className="size-[18px] dark:hidden"
        strokeWidth={1.8}
      />
      <span className="sr-only dark:hidden">Switch to dark mode</span>
      <span className="sr-only hidden dark:inline">Switch to light mode</span>
    </button>
  );
}
