import { serverApiGet } from "./server-api";
import type { ShopSettings } from "@/types/api";

let cached: string | undefined;

/** Server-side: get the currency code from storefront settings (cached per request batch). */
export async function getCurrency(): Promise<string> {
  if (cached) return cached;
  const data = await serverApiGet<{ settings: ShopSettings }>("/storefront/settings");
  cached = data?.settings?.currency || "EUR";
  return cached;
}
