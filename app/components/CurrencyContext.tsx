"use client";

import { createContext, useContext, type ReactNode } from "react";

const CurrencyContext = createContext<string>("EUR");

export function CurrencyProvider({ currency, children }: { currency: string; children: ReactNode }) {
  return <CurrencyContext.Provider value={currency}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
