/** URL query state for /shop — single source for building links and API calls */

export type ShopQueryState = {
  q?: string;
  search?: string;
  category_slug?: string;
  brand_slug?: string;
  tag_slug?: string;
  sort?: string;
  on_sale?: string;
  featured?: string;
  min_price?: string;
  max_price?: string;
  rating?: string;
  limit?: string;
  page?: string;
};

const DEFAULT_SORT = "newest";
const DEFAULT_LIMIT = "24";

export function buildShopQueryString(state: ShopQueryState): string {
  const qs = new URLSearchParams();
  const search = (state.search || state.q || "").trim();
  if (search) qs.set("search", search);
  if (state.category_slug?.trim()) qs.set("category_slug", state.category_slug.trim());
  if (state.brand_slug?.trim()) qs.set("brand_slug", state.brand_slug.trim());
  if (state.tag_slug?.trim()) qs.set("tag_slug", state.tag_slug.trim());
  const sort = state.sort?.trim() || DEFAULT_SORT;
  if (sort && sort !== DEFAULT_SORT) qs.set("sort", sort);
  if (state.on_sale === "true") qs.set("on_sale", "true");
  if (state.featured === "true") qs.set("featured", "true");
  if (state.min_price?.trim()) qs.set("min_price", state.min_price.trim());
  if (state.max_price?.trim()) qs.set("max_price", state.max_price.trim());
  if (state.rating?.trim()) qs.set("rating", state.rating.trim());
  const limit = state.limit?.trim() || DEFAULT_LIMIT;
  if (limit && limit !== DEFAULT_LIMIT) qs.set("limit", limit);
  const page = state.page?.trim() || "1";
  if (page !== "1") qs.set("page", page);
  return qs.toString();
}

/** For API: storefront expects `search` not always `q` — mirror shop page behaviour */
export function buildProductsApiQueryString(state: ShopQueryState): string {
  const qs = new URLSearchParams();
  const search = (state.search || state.q || "").trim();
  if (search) qs.set("search", search);
  if (state.category_slug?.trim()) qs.set("category_slug", state.category_slug.trim());
  if (state.brand_slug?.trim()) qs.set("brand_slug", state.brand_slug.trim());
  if (state.tag_slug?.trim()) qs.set("tag_slug", state.tag_slug.trim());
  qs.set("sort", state.sort?.trim() || DEFAULT_SORT);
  if (state.on_sale === "true") qs.set("on_sale", "true");
  if (state.featured === "true") qs.set("featured", "true");
  if (state.min_price?.trim()) qs.set("min_price", state.min_price.trim());
  if (state.max_price?.trim()) qs.set("max_price", state.max_price.trim());
  if (state.rating?.trim()) qs.set("rating", state.rating.trim());
  qs.set("limit", state.limit?.trim() || DEFAULT_LIMIT);
  qs.set("page", state.page?.trim() || "1");
  return qs.toString();
}

export function countActiveShopFilters(state: ShopQueryState): number {
  let n = 0;
  if (state.category_slug?.trim()) n++;
  if (state.brand_slug?.trim()) n++;
  if (state.tag_slug?.trim()) n++;
  if (state.on_sale === "true") n++;
  if (state.featured === "true") n++;
  if (state.min_price?.trim()) n++;
  if (state.max_price?.trim()) n++;
  if (state.rating?.trim()) n++;
  return n;
}

export function shopPathFromState(state: ShopQueryState): string {
  const q = buildShopQueryString(state);
  return q ? `/shop?${q}` : "/shop";
}
