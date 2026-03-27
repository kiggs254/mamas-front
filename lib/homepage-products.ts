import { serverApiGet } from "@/lib/server-api";
import type { StorefrontProduct } from "@/types/api";
import { getStorefrontBranchIdCookie } from "@/lib/branch-cookie-server";

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === "") continue;
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

/** GET /storefront/products with typed query params */
export async function fetchStorefrontProducts(
  params: Record<string, string | number | boolean | undefined>,
): Promise<StorefrontProduct[]> {
  const q = buildQuery(params);
  const branchId = await getStorefrontBranchIdCookie();
  const branchPart = branchId != null ? `${q.includes("?") ? "&" : "?"}branch_id=${branchId}` : "";
  const data = await serverApiGet<{ products: StorefrontProduct[] }>(`/storefront/products${q}${branchPart}`);
  return data?.products ?? [];
}

/**
 * Use the first query that returns at least one product (e.g. on_sale → featured → newest).
 */
export async function fetchStorefrontProductsWithFallback(
  primary: Record<string, string | number | boolean | undefined>,
  fallbacks: Record<string, string | number | boolean | undefined>[],
): Promise<StorefrontProduct[]> {
  const first = await fetchStorefrontProducts(primary);
  if (first.length > 0) return first;
  for (const fb of fallbacks) {
    const next = await fetchStorefrontProducts(fb);
    if (next.length > 0) return next;
  }
  return [];
}
