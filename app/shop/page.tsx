import type { Metadata } from "next";
import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import { getSiteUrl } from "@/lib/api-config";
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
import { normalizeCategory, normalizeStorefrontCategoryTree } from "@/lib/categories";

/** Trim SEO text to a meta-description-friendly length (~160 chars) on a word boundary. */
function clampMeta(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const categorySlug = typeof sp.category_slug === "string" ? sp.category_slug : "";

  const siteUrl = getSiteUrl();
  const storeName = "Mama's Market";

  // Only category pages get bespoke, data-driven SEO. Other shop views (search,
  // brand, tag, the bare /shop) fall back to a generic store description.
  if (!categorySlug) {
    const canonical = `${siteUrl}/shop`;
    const title = `Shop — ${storeName}`;
    const description = clampMeta(
      `Browse fresh produce, international groceries, and everyday essentials at ${storeName} in Vaasa.`,
    );
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical, type: "website", siteName: storeName },
    };
  }

  const catData = await serverApiGet<{ categories: StorefrontCategory[] }>(
    "/storefront/categories",
  );
  const tree = normalizeStorefrontCategoryTree(catData?.categories || []);
  const match = findCategoryBySlug(tree, categorySlug);
  const cat = match ? normalizeCategory(match) : null;

  const name = cat?.name || slugToTitle(categorySlug);
  const title = cat?.seoTitle || `${name} — ${storeName}`;
  const description = clampMeta(
    cat?.seoDescription ||
      cat?.description ||
      `Shop ${name} at ${storeName} in Vaasa — fresh produce, international groceries, and everyday essentials.`,
  );
  const canonical = `${siteUrl}/shop?category_slug=${encodeURIComponent(categorySlug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website", siteName: storeName },
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

  const [data, customer, catData, cheapData, priceyData] = await Promise.all([
    serverApiGet<{
      products: StorefrontProduct[];
      total: number;
      page: number;
      limit: number;
    }>(`/storefront/products?${apiQs}`),
    getCustomer(),
    serverApiGet<{ categories: StorefrontCategory[] }>("/storefront/categories"),
    serverApiGet<{ products: StorefrontProduct[] }>(`/storefront/products?limit=1&sort=price_asc`),
    serverApiGet<{ products: StorefrontProduct[] }>(`/storefront/products?limit=1&sort=price_desc`),
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
  const selectedCategoryNorm = selectedCategory ? normalizeCategory(selectedCategory) : null;
  // Server-rendered intro under the <h1> so crawlers see the category SEO copy.
  const categoryIntro = categorySlug
    ? selectedCategoryNorm?.seoDescription || selectedCategoryNorm?.description || null
    : null;

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
        {categoryIntro ? <p className={shell.lead}>{categoryIntro}</p> : null}
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
