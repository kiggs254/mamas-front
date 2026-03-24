"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { apiPost } from "@/lib/api";
import { mutate } from "swr";

/** Restores abandoned cart when URL contains ?ac_token=... */
export default function AbandonedCartRestore() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = searchParams.get("ac_token");
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BROWSER_BASE || "/api/v1"}/storefront/marketing/abandoned-cart/restore?token=${encodeURIComponent(token)}`,
          { credentials: "include" }
        );
        const json = await res.json();
        if (!res.ok || json.status !== "success" || cancelled) return;
        const cartItems = json.data?.cart_items as
          | { slug?: string; product_id?: number; quantity?: number; variantId?: number }[]
          | undefined;
        if (!Array.isArray(cartItems)) return;
        for (const row of cartItems) {
          const pid = row.product_id;
          if (!pid) continue;
          await apiPost("/storefront/cart", {
            product_id: pid,
            quantity: Math.max(1, Number(row.quantity) || 1),
            ...(row.variantId ? { variant_id: row.variantId } : {}),
          });
        }
        await mutate("/storefront/cart");
        const p = new URLSearchParams(searchParams.toString());
        p.delete("ac_token");
        router.replace(p.toString() ? `${pathname}?${p}` : pathname);
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, pathname]);

  return null;
}
