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
    <div className="min-h-dvh bg-frame lg:p-4 2xl:p-5">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1640px] bg-paper lg:min-h-[calc(100dvh-2rem)] lg:overflow-hidden lg:rounded-frame lg:border lg:border-line 2xl:min-h-[calc(100dvh-2.5rem)]">
        <aside className="hidden shrink-0 border-r border-line lg:block">
          <Sidebar
            profile={profile}
            pendingRequests={pendingRequests}
            demo={demo}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-canvas">
          <Topbar
            profile={profile}
            pendingRequests={pendingRequests}
            demo={demo}
            onMenu={() => setNavOpen(true)}
          />
          <main className="flex-1 px-4 pb-10 sm:px-6 lg:px-8">
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
            className="absolute inset-0 bg-black/40"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="absolute inset-y-0 left-0 w-[284px] max-w-[85vw] border-r border-line bg-paper shadow-pop"
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
