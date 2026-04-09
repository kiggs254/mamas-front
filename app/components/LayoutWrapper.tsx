"use client";

import { Suspense } from "react";
import CartSidebar from "./CartSidebar";
import AbandonedCartRestore from "./AbandonedCartRestore";
import { AgeRestrictionProvider } from "./AgeRestrictionContext";
import { CurrencyProvider } from "./CurrencyContext";

export default function LayoutWrapper({
  children,
  header,
  footer,
  currency,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
  currency: string;
}) {
  return (
    <CurrencyProvider currency={currency}>
    <AgeRestrictionProvider>
      <Suspense fallback={null}>
        <AbandonedCartRestore />
      </Suspense>
      <CartSidebar />
      {header}
      <main>{children}</main>
      {footer}
    </AgeRestrictionProvider>
    </CurrencyProvider>
  );
}
