"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import LocationPicker from "./LocationPicker";
import CartSidebar from "./CartSidebar";
import AbandonedCartRestore from "./AbandonedCartRestore";

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
    <>
      <Suspense fallback={null}>
        <AbandonedCartRestore />
      </Suspense>
      <LocationPicker />
      <CartSidebar />
      {header}
      <main>{children}</main>
      {footer}
    </>
  );
}
