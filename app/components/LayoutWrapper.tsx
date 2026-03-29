"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import LocationPicker from "./LocationPicker";
import CartSidebar from "./CartSidebar";
import AbandonedCartRestore from "./AbandonedCartRestore";
import { BranchCartConflictProvider } from "./BranchCartConflictContext";
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
  const pathname = usePathname();
  const isCheckout = pathname === "/checkout";

  if (isCheckout) {
    return (
      <>
        <Suspense fallback={null}>
          <AbandonedCartRestore />
        </Suspense>
        {children}
      </>
    );
  }

  return (
    <AgeRestrictionProvider>
      <BranchCartConflictProvider>
        <Suspense fallback={null}>
          <AbandonedCartRestore />
        </Suspense>
        <LocationPicker />
        <CartSidebar />
        {header}
        <main>{children}</main>
        {footer}
      </BranchCartConflictProvider>
    </AgeRestrictionProvider>
  );
}
