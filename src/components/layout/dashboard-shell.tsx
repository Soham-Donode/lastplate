"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/types";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function DashboardShell({
  profile,
  pendingRequests,
  demo,
  children,
}: {
  profile: Profile;
  pendingRequests: number;
  demo: boolean;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!navOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setNavOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [navOpen]);

  return (
    <div className="app-ambient min-h-dvh p-0 sm:p-3 lg:p-4 xl:p-5">
      <div className="glass-window relative mx-auto flex min-h-dvh w-full max-w-[1680px] flex-col overflow-hidden rounded-none sm:min-h-[calc(100dvh-1.5rem)] sm:rounded-[26px] lg:min-h-[calc(100dvh-2rem)] lg:flex-row lg:rounded-[30px] xl:min-h-[calc(100dvh-2.5rem)]">
        <aside className="hidden shrink-0 border-r border-line bg-surface lg:block">
          <Sidebar
            profile={profile}
            pendingRequests={pendingRequests}
            demo={demo}
          />
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <Topbar
            profile={profile}
            pendingRequests={pendingRequests}
            demo={demo}
            onMenu={() => setNavOpen(true)}
          />
          <main className="flex-1 px-3 pb-8 pt-1 sm:px-5 sm:pb-10 lg:px-6">
            <div className="mx-auto w-full max-w-[1280px]">{children}</div>
          </main>
        </div>
      </div>

      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="glass-strong absolute inset-y-0 left-0 w-[286px] max-w-[86vw] overflow-hidden rounded-r-[26px] border-y-0 border-l-0 shadow-pop"
          >
            <Sidebar
              profile={profile}
              pendingRequests={pendingRequests}
              demo={demo}
              onClose={() => setNavOpen(false)}
              onNavigate={() => setNavOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
