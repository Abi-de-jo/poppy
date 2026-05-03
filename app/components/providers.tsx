// components/providers.tsx
"use client";

import { AppProvider } from "@/app/contexts/AppContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}