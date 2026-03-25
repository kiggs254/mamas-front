import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import type { StorefrontProduct } from "@/types/api";
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
import shell from "../styles/shell.module.css";
import styles from "./shop.module.css";

function slugToTitle(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  const q = typeof sp.q === "string" ? sp.q : "";
  const search = typeof sp.search === "string" ? sp.search : q;
  if (search) qs.set("search", search);
  const categorySlug = typeof sp.category_slug === "string" ? sp.category_slug : "";
  const brandSlug = typeof sp.brand_slug === "string" ? sp.brand_slug : "";
  const tagSlug = typeof sp.tag_slug === "string" ? sp.tag_slug : "";
  if (categorySlug) qs.set("category_slug", categorySlug);
  if (brandSlug) qs.set("brand_slug", brandSlug);
  if (tagSlug) qs.set("tag_slug", tagSlug);
  if (typeof sp.sort === "string") qs.set("sort", sp.sort);
  if (typeof sp.on_sale === "string") qs.set("on_sale", sp.on_sale);
  if (typeof sp.featured === "string") qs.set("featured", sp.featured);
  qs.set("limit", "24");
  qs.set("page", typeof sp.page === "string" ? sp.page : "1");

  const query = qs.toString();
  const [data, customer] = await Promise.all([
    serverApiGet<{
      products: StorefrontProduct[];
      total: number;
      page: number;
      limit: number;
    }>(`/storefront/products?${query}`),
    getCustomer(),
  ]);

  const products = data?.products || [];
  const total = data?.total ?? 0;
  const page = data?.page ?? 1;
  const limit = data?.limit ?? 24;

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
    pageTitle = first?.category?.slug === categorySlug && first.category.name ? first.category.name : slugToTitle(categorySlug);
    contextLabel = "Category";
  } else if (brandSlug) {
    pageTitle = first?.brand?.slug === brandSlug && first.brand?.name ? first.brand.name : slugToTitle(brandSlug);
    contextLabel = "Brand";
  } else if (tagSlug) {
    const tagName = first?.tags?.find((t) => t.slug === tagSlug)?.name;
    pageTitle = tagName || slugToTitle(tagSlug);
    contextLabel = "Tag";
  }

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

      <form className={`${shell.panel} ${styles.filterForm}`} method="get">
        <input type="hidden" name="q" value={search} />
        {categorySlug ? <input type="hidden" name="category_slug" value={categorySlug} /> : null}
        {brandSlug ? <input type="hidden" name="brand_slug" value={brandSlug} /> : null}
        {tagSlug ? <input type="hidden" name="tag_slug" value={tagSlug} /> : null}
        <select name="sort" defaultValue={typeof sp.sort === "string" ? sp.sort : "newest"}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="best_sellers">Best sellers</option>
        </select>
        <label>
          <input type="checkbox" name="on_sale" value="true" defaultChecked={sp.on_sale === "true"} />
          On sale only
        </label>
        <button type="submit">Apply filters</button>
      </form>

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
              initialInWishlist={wl.has(product.id)}
            />
          );
        })}
      </div>

      {products.length === 0 ? (
        <p className={shell.empty}>No products match these filters. Try clearing filters or browse all products.</p>
      ) : null}

      {total > limit && (
        <div className={shell.pager}>
          {page > 1 && (
            <Link
              className={shell.pagerLink}
              href={`/shop?${(() => {
                const p = new URLSearchParams(qs.toString());
                p.set("page", String(page - 1));
                return p.toString();
              })()}`}
              prefetch={false}
            >
              Previous
            </Link>
          )}
          {page * limit < total && (
            <Link
              className={shell.pagerLink}
              href={`/shop?${(() => {
                const p = new URLSearchParams(qs.toString());
                p.set("page", String(page + 1));
                return p.toString();
              })()}`}
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
