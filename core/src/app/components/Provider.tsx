"use client";

import { ReactNode } from "react";

interface ProviderProps {
  children: ReactNode;
}

// Supabase handles auth state via cookies, no provider needed
const Provider = ({ children }: ProviderProps) => {
  return <>{children}</>;
};

export default Provider;
