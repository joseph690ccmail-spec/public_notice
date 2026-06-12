"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface AppNavigationContextValue {
  navigate: (href: string) => void;
  isPending: boolean;
}

const AppNavigationContext = createContext<AppNavigationContextValue | null>(null);

export function AppNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router]
  );

  return (
    <AppNavigationContext.Provider value={{ navigate, isPending }}>
      {isPending && <div className="app-nav-progress" aria-hidden />}
      {children}
    </AppNavigationContext.Provider>
  );
}

export function useAppNavigation(): AppNavigationContextValue {
  const context = useContext(AppNavigationContext);
  if (!context) {
    throw new Error("useAppNavigation must be used within AppNavigationProvider.");
  }
  return context;
}