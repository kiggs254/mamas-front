"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const REFRESH_MS = 90_000;

/**
 * Re-runs server components so branch OOS / ERP sync updates appear without a full reload.
 * Refreshes on an interval and when the tab becomes visible again.
 */
export default function CatalogStockRefresher() {
  const router = useRouter();
  const pathname = usePathname();
  const path = pathname || "";
  const enabled =
    path === "/" || path.startsWith("/shop") || path.startsWith("/product/");

  useEffect(() => {
    if (!enabled) return;
    const tick = () => router.refresh();
    const id = window.setInterval(tick, REFRESH_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [enabled, router]);

  return null;
}
