"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type AdvisorChatContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  maximized: boolean;
  setMaximized: (value: boolean) => void;
};

const AdvisorChatContext = createContext<AdvisorChatContextValue | null>(null);

export function AdvisorChatProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);

  const toggle = useCallback(() => {
    setOpen((v) => !v);
    setMaximized(false);
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, toggle, maximized, setMaximized }),
    [open, toggle, maximized],
  );

  return (
    <AdvisorChatContext.Provider value={value}>{children}</AdvisorChatContext.Provider>
  );
}

export function useAdvisorChat() {
  const ctx = useContext(AdvisorChatContext);
  if (!ctx) {
    throw new Error("useAdvisorChat must be used within AdvisorChatProvider");
  }
  return ctx;
}
