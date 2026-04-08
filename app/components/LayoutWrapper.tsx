"use client";

import { Suspense } from "react";
import CartSidebar from "./CartSidebar";
import AbandonedCartRestore from "./AbandonedCartRestore";
import { AgeRestrictionProvider } from "./AgeRestrictionContext";

export default function LayoutWrapper({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <AgeRestrictionProvider>
      <Suspense fallback={null}>
        <AbandonedCartRestore />
      </Suspense>
      <CartSidebar />
      {header}
      <main>{children}</main>
      {footer}
    </AgeRestrictionProvider>
  );
}
