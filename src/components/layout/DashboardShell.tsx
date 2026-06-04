"use client";

import { useEffect, useState } from "react";
import { AdvisorChatProvider, useAdvisorChat } from "@/components/layout/advisor-chat-context";
import AdvisorChatPanel from "@/components/layout/AdvisorChatPanel";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const { open: advisorOpen } = useAdvisorChat();

  useEffect(() => {
    if (!navOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [navOpen]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Sidebar mobileOpen={navOpen} onNavigate={() => setNavOpen(false)} />

      {navOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      ) : null}

      <AdvisorChatPanel />

      <div
        className={[
          "flex flex-col min-h-screen min-w-0 transition-[padding] duration-200 ease-out",
          advisorOpen ? "lg:pl-[40rem]" : "lg:pl-64",
        ].join(" ")}
      >
        <TopBar onMenuClick={() => setNavOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AdvisorChatProvider>
      <DashboardShellInner>{children}</DashboardShellInner>
    </AdvisorChatProvider>
  );
}
