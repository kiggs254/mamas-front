import { fetchStorefrontProducts, fetchStorefrontProductsWithFallback } from "@/lib/homepage-products";
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

/** Load products for a homepage "products" section from admin config. */
export async function fetchProductsForHomepageSection(
  config: Record<string, unknown> | undefined,
): Promise<StorefrontProduct[]> {
  const c = config || {};
  const limit = typeof c.limit === "number" && c.limit > 0 ? Math.min(c.limit, 48) : 12;
  const source = String(c.source || "manual");

  const branchId = await getStorefrontBranchIdCookie();

  if (source === "manual") {
    const ids = Array.isArray(c.product_ids) ? c.product_ids.map((x) => Number(x)).filter((n) => n > 0) : [];
    if (ids.length === 0) return [];
    const manualParams: Record<string, string | number> = { ids: ids.join(",") };
    if (branchId != null) manualParams.branch_id = branchId;
    const q = buildQuery(manualParams);
    const data = await serverApiGet<{ products: StorefrontProduct[] }>(`/storefront/products/by-ids${q}`);
    const list = data?.products ?? [];
    const order = new Map(ids.map((id, i) => [id, i]));
    return [...list].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }

  if (source === "best_sellers") {
    return fetchStorefrontProductsWithFallback(
      { sort: "best_sellers", limit },
      [{ sort: "newest", limit }],
    );
  }

  if (source === "on_sale") {
    return fetchStorefrontProductsWithFallback(
      { on_sale: true, limit },
      [{ sort: "newest", limit }],
    );
  }

  if (source === "category" && typeof c.category_slug === "string" && c.category_slug.trim()) {
    return fetchStorefrontProductsWithFallback(
      { category_slug: c.category_slug.trim(), limit, sort: "newest" },
      [{ sort: "newest", limit }],
    );
  }

  if (source === "brand" && typeof c.brand_slug === "string" && c.brand_slug.trim()) {
    return fetchStorefrontProductsWithFallback(
      { brand_slug: c.brand_slug.trim(), limit, sort: "newest" },
      [{ sort: "newest", limit }],
    );
  }

  if (source === "tag" && typeof c.tag_slug === "string" && c.tag_slug.trim()) {
    return fetchStorefrontProductsWithFallback(
      { tag_slug: c.tag_slug.trim(), limit, sort: "newest" },
      [{ sort: "newest", limit }],
    );
  }

  // default: featured + fallbacks
  return fetchStorefrontProductsWithFallback(
    { featured: true, limit },
    [{ sort: "best_sellers", limit }, { sort: "newest", limit }],
  );
}
