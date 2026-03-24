import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import type { StorefrontProduct } from "@/types/api";
import { productEffectivePrice, productHref, productPrimaryImage, productRatingApprox } from "@/lib/products";
import styles from "./PopularProducts.module.css";
import { StarIcon } from "./Icons";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import { getCustomer } from "@/lib/auth";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.rating}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} size={12} filled={i <= rating} />
      ))}
    </div>
  );
}

async function wishlistSet(customerId: number | null): Promise<Set<number>> {
  if (!customerId) return new Set();
  const data = await serverApiGet<{ items: { product_id: number }[] }>("/storefront/wishlist");
  const ids = data?.items?.map((i) => i.product_id) || [];
  return new Set(ids);
}

export default async function PopularProducts() {
  const [data, customer] = await Promise.all([
    serverApiGet<{ products: StorefrontProduct[] }>("/storefront/products?sort=best_sellers&limit=10"),
    getCustomer(),
  ]);
  const products = data?.products || [];
  const wl = await wishlistSet(customer?.id ?? null);

  return (
    <section className={styles.section}>
      <div className="section-title">
        <h2>Popular Products</h2>
        <div className="tabs">
          <Link href="/shop" className="active">
            All
          </Link>
          <Link href="/shop?sort=price_asc">Price ↑</Link>
          <Link href="/shop?sort=newest">New</Link>
        </div>
      </div>
      <div className={styles.grid}>
        {products.length === 0 ? (
          <p style={{ gridColumn: "1/-1" }}>No products to show yet.</p>
        ) : (
          products.map((product) => {
            const { price, oldPrice } = productEffectivePrice(product);
            const img = productPrimaryImage(product);
            const href = productHref(product);
            const rating = productRatingApprox(product);
            const v0 = product.variants?.[0];
            return (
              <div key={product.id} className={styles.card}>
                {product.is_featured && (
                  <span className={styles.badge} style={{ background: "#F74B81" }}>
                    Hot
                  </span>
                )}
                <Link href={href} className={styles.imageWrap} prefetch={false}>
                  {img ? (
                    <Image src={img} alt={product.name} width={200} height={200} style={{ objectFit: "contain" }} />
                  ) : (
                    <span>📦</span>
                  )}
                </Link>
                <div className={styles.category}>{product.category?.name || "—"}</div>
                <Link href={href} className={styles.name} prefetch={false}>
                  {product.name}
                </Link>
                <StarRating rating={rating} />
                <div className={styles.priceRow}>
                  <div>
                    <span className={styles.price}>KES {price.toFixed(2)}</span>
                    {oldPrice != null && (
                      <span className={styles.oldPrice}>KES {oldPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <WishlistButton productId={product.id} initialInWishlist={wl.has(product.id)} />
                    <AddToCartButton
                      productId={product.id}
                      variantId={v0?.id}
                      className={styles.addBtn}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
