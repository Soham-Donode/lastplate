"use client";

import { useCallback, useState } from "react";
import type { Profile } from "@/types";
import { MobileDialog } from "./mobile-dialog";
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

  const closeNav = useCallback(() => setNavOpen(false), []);

  return (
    <div className="app-ambient min-h-dvh p-0 sm:p-3 lg:p-4 xl:p-5">
      <div className="glass-window relative mx-auto flex min-h-dvh w-full max-w-[1680px] flex-col overflow-clip rounded-none max-sm:border-0 sm:min-h-[calc(100dvh-1.5rem)] sm:rounded-[26px] lg:min-h-[calc(100dvh-2rem)] lg:flex-row lg:rounded-[30px] xl:min-h-[calc(100dvh-2.5rem)]">
        <aside className="hidden shrink-0 border-r border-line bg-surface lg:block">
          <div className="sticky top-4 h-[calc(100dvh-2rem)] xl:top-5 xl:h-[calc(100dvh-2.5rem)]">
            <Sidebar
              profile={profile}
              pendingRequests={pendingRequests}
              demo={demo}
            />
          </div>
        </aside>

        <div className="relative flex min-w-0 flex-1 flex-col">
          <Topbar
            profile={profile}
            pendingRequests={pendingRequests}
            demo={demo}
            navOpen={navOpen}
            onMenu={() => setNavOpen(true)}
          />
          <main className="flex-1 px-4 pt-3 pb-8 [overflow-wrap:anywhere] sm:px-5 sm:pb-10 lg:px-6">
            <div className="mx-auto w-full max-w-[1280px]">{children}</div>
          </main>
        </div>
      </div>

      <MobileDialog
        id="dashboard-navigation"
        label="Navigation"
        open={navOpen}
        desktopWidth="64rem"
        onClose={closeNav}
        className="glass-strong inset-y-0 left-0 h-dvh max-h-dvh w-[min(18rem,86vw)] overflow-hidden rounded-r-panel border-y-0 border-l-0 shadow-pop"
      >
        <Sidebar
          profile={profile}
          pendingRequests={pendingRequests}
          demo={demo}
          onClose={closeNav}
          onNavigate={closeNav}
        />
      </MobileDialog>
    </div>
  );
}
