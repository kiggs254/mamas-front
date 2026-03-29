import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import type { StorefrontCategory, StorefrontProduct } from "@/types/api";
import {
  productEffectivePrice,
  productHref,
  productPrimaryImage,
  productRatingApprox,
  productReviewCount,
  productSalePercentOff,
} from "@/lib/products";
import { getCustomer } from "@/lib/auth";
import StoreProductCard from "../components/StoreProductCard";
import ShopToolbar from "../components/ShopToolbar";
import FilterPanel from "../components/FilterPanel";
import shell from "../styles/shell.module.css";
import styles from "./shop.module.css";
import {
  buildProductsApiQueryString,
  countActiveShopFilters,
  shopPathFromState,
  type ShopQueryState,
} from "@/lib/shop-query";
import { getStorefrontBranchIdCookie } from "@/lib/branch-cookie-server";
import { normalizeStorefrontCategoryTree } from "@/lib/categories";

function slugToTitle(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function findCategoryBySlug(categories: StorefrontCategory[], slug?: string): StorefrontCategory | null {
  if (!slug) return null;
  for (const category of categories) {
    if (category.slug === slug) return category;
    const nested = findCategoryBySlug(category.children || [], slug);
    if (nested) return nested;
  }
  return null;
}

const ALLOWED_LIMITS = new Set(["10", "15", "24", "48"]);

function parseShopState(sp: Record<string, string | string[] | undefined>): ShopQueryState {
  const q = typeof sp.q === "string" ? sp.q : "";
  const search = typeof sp.search === "string" ? sp.search : q;
  const limitRaw = typeof sp.limit === "string" ? sp.limit : "24";
  const limit = ALLOWED_LIMITS.has(limitRaw) ? limitRaw : "24";
  return {
    q: search,
    search,
    category_slug: typeof sp.category_slug === "string" ? sp.category_slug : undefined,
    brand_slug: typeof sp.brand_slug === "string" ? sp.brand_slug : undefined,
    tag_slug: typeof sp.tag_slug === "string" ? sp.tag_slug : undefined,
    sort: typeof sp.sort === "string" ? sp.sort : "newest",
    on_sale: sp.on_sale === "true" ? "true" : undefined,
    featured: sp.featured === "true" ? "true" : undefined,
    min_price: typeof sp.min_price === "string" ? sp.min_price : undefined,
    max_price: typeof sp.max_price === "string" ? sp.max_price : undefined,
    rating: typeof sp.rating === "string" ? sp.rating : undefined,
    limit,
    page: typeof sp.page === "string" ? sp.page : "1",
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const state = parseShopState(sp);
  const search = (state.search || "").trim();
  const categorySlug = state.category_slug || "";
  const brandSlug = state.brand_slug || "";
  const tagSlug = state.tag_slug || "";

  const apiQs = buildProductsApiQueryString(state);
  const branchId = await getStorefrontBranchIdCookie();
  const bq = branchId != null ? `&branch_id=${branchId}` : "";

  const [data, customer, catData, cheapData, priceyData] = await Promise.all([
    serverApiGet<{
      products: StorefrontProduct[];
      total: number;
      page: number;
      limit: number;
    }>(`/storefront/products?${apiQs}${bq}`),
    getCustomer(),
    serverApiGet<{ categories: StorefrontCategory[] }>("/storefront/categories"),
    serverApiGet<{ products: StorefrontProduct[] }>(`/storefront/products?limit=1&sort=price_asc${bq}`),
    serverApiGet<{ products: StorefrontProduct[] }>(`/storefront/products?limit=1&sort=price_desc${bq}`),
  ]);

  const products = data?.products || [];
  const total = data?.total ?? 0;
  const page = data?.page ?? 1;
  const limit = data?.limit ?? (Number(state.limit || "24") || 24);

  const cheapP = cheapData?.products?.[0];
  const priceyP = priceyData?.products?.[0];
  const priceHintMin = cheapP ? productEffectivePrice(cheapP).price : undefined;
  const priceHintMax = priceyP ? productEffectivePrice(priceyP).price : undefined;

  const categoryTree = normalizeStorefrontCategoryTree(catData?.categories || []);
  const selectedCategory = findCategoryBySlug(categoryTree, categorySlug);

  const wlData =
    customer &&
    (await serverApiGet<{ items: { product_id: number }[] }>("/storefront/wishlist"));
  const wl = new Set(wlData?.items?.map((i) => i.product_id) || []);

  const first = products[0];
  let pageTitle = "Shop";
  let contextLabel: string | null = null;
  if (search) {
    pageTitle = `Search results`;
    contextLabel = `“${search}”`;
  } else if (categorySlug) {
    pageTitle = selectedCategory?.name || slugToTitle(categorySlug);
    contextLabel = "Category";
  } else if (brandSlug) {
    pageTitle =
      first?.brand?.slug === brandSlug && first.brand?.name ? first.brand.name : slugToTitle(brandSlug);
    contextLabel = "Brand";
  } else if (tagSlug) {
    const tagName = first?.tags?.find((t) => t.slug === tagSlug)?.name;
    pageTitle = tagName || slugToTitle(tagSlug);
    contextLabel = "Tag";
  }

  const activeFilterCount = countActiveShopFilters(state);

  return (
    <div className={shell.shell}>
      <nav className={shell.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={shell.sep}>/</span>
        <Link href="/shop">Shop</Link>
        {(categorySlug || brandSlug || tagSlug || search) && (
          <>
            <span className={shell.sep}>/</span>
            <span>{pageTitle}</span>
          </>
        )}
      </nav>

      <header className={shell.pageHero}>
        <p className={shell.eyebrow}>{contextLabel || "Store"}</p>
        <h1 className={shell.title}>{pageTitle}</h1>
        <div className={shell.titleUnderline} />
        <p className={shell.lead}>
          {total} product{total === 1 ? "" : "s"}
          {search && contextLabel ? ` matching ${contextLabel}` : ""}
          {!search && categorySlug ? " in this category" : ""}
          {!search && brandSlug ? " from this brand" : ""}
          {!search && tagSlug ? " with this tag" : ""}
          {!search && !categorySlug && !brandSlug && !tagSlug ? " — browse and filter below." : "."}
        </p>
      </header>

      <ShopToolbar
        state={state}
        total={total}
        activeFilterCount={activeFilterCount}
        filterPanel={
          <FilterPanel
            categories={categoryTree}
            state={state}
            priceHintMin={priceHintMin}
            priceHintMax={priceHintMax}
          />
        }
      />

      <div className={styles.grid}>
        {products.map((product) => {
          const { price, oldPrice } = productEffectivePrice(product);
          const img = productPrimaryImage(product);
          const href = productHref(product);
          const rating = productRatingApprox(product);
          const reviews = productReviewCount(product);
          const v0 = product.variants?.[0];
          const discount = oldPrice != null ? productSalePercentOff(price, oldPrice) : 0;
          return (
            <StoreProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              href={href}
              imageUrl={img}
              categoryLabel={product.category?.name || "—"}
              price={price}
              oldPrice={oldPrice ?? null}
              discountPercent={discount}
              rating={rating}
              reviewCount={reviews}
              variantId={v0?.id}
              ageRestricted={Boolean(product.age_restricted)}
              initialInWishlist={wl.has(product.id)}
            />
          );
        })}
      </div>

      {products.length === 0 ? (
        <p className={shell.empty}>
          No products match these filters. Try clearing filters or browse all products.
        </p>
      ) : null}

      {total > limit && (
        <div className={shell.pager}>
          {page > 1 && (
            <Link
              className={shell.pagerLink}
              href={shopPathFromState({ ...state, page: String(page - 1) })}
              prefetch={false}
            >
              Previous
            </Link>
          )}
          {page * limit < total && (
            <Link
              className={shell.pagerLink}
              href={shopPathFromState({ ...state, page: String(page + 1) })}
              prefetch={false}
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
