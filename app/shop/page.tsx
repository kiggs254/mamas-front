import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import type { StorefrontProduct } from "@/types/api";
import { productEffectivePrice, productHref, productPrimaryImage, productRatingApprox } from "@/lib/products";
import AddToCartButton from "../components/AddToCartButton";
import WishlistButton from "../components/WishlistButton";
import { getCustomer } from "@/lib/auth";
import styles from "./shop.module.css";

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
  if (typeof sp.category_slug === "string") qs.set("category_slug", sp.category_slug);
  if (typeof sp.brand_slug === "string") qs.set("brand_slug", sp.brand_slug);
  if (typeof sp.tag_slug === "string") qs.set("tag_slug", sp.tag_slug);
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

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <h1 className={styles.title}>Shop</h1>
        <p className={styles.meta}>
          {total} products {search ? `matching “${search}”` : ""}
        </p>
        <form className={styles.filters} method="get">
          <input type="hidden" name="q" value={search} />
          <select name="sort" defaultValue={typeof sp.sort === "string" ? sp.sort : "newest"}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="best_sellers">Best sellers</option>
          </select>
          <label>
            <input type="checkbox" name="on_sale" value="true" defaultChecked={sp.on_sale === "true"} />
            On sale
          </label>
          <button type="submit">Apply</button>
        </form>
      </div>

      <div className={styles.grid}>
        {products.map((product) => {
          const { price, oldPrice } = productEffectivePrice(product);
          const img = productPrimaryImage(product);
          const href = productHref(product);
          const rating = productRatingApprox(product);
          const v0 = product.variants?.[0];
          return (
            <div key={product.id} className={styles.card}>
              <Link href={href} className={styles.imageWrap} prefetch={false}>
                {img ? (
                  <Image src={img} alt="" width={220} height={220} style={{ objectFit: "contain" }} />
                ) : (
                  <span>📦</span>
                )}
              </Link>
              <Link href={href} className={styles.name} prefetch={false}>
                {product.name}
              </Link>
              <div className={styles.rating}>★ {rating}</div>
              <div className={styles.priceRow}>
                <span>KES {price.toFixed(2)}</span>
                {oldPrice != null && <span className={styles.old}>KES {oldPrice.toFixed(2)}</span>}
              </div>
              <div className={styles.actions}>
                <WishlistButton productId={product.id} initialInWishlist={wl.has(product.id)} />
                <AddToCartButton productId={product.id} variantId={v0?.id} />
              </div>
            </div>
          );
        })}
      </div>

      {total > limit && (
        <div className={styles.pager}>
          {page > 1 && (
            <Link
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
