"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useBranchCartConflict } from "@/hooks/useBranchCartConflict";

type Value = ReturnType<typeof useBranchCartConflict>;

const BranchCartConflictContext = createContext<Value | null>(null);

export function BranchCartConflictProvider({ children }: { children: ReactNode }) {
  const value = useBranchCartConflict();
  return <BranchCartConflictContext.Provider value={value}>{children}</BranchCartConflictContext.Provider>;
}

export function useBranchCartConflictState(): Value | null {
  return useContext(BranchCartConflictContext);
}
