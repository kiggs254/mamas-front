import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import {
  productEffectivePrice,
  productHref,
  productPrimaryImage,
  productRatingApprox,
  productReviewCount,
  productSalePercentOff,
} from "@/lib/products";
import { fetchStorefrontProductsWithFallback } from "@/lib/homepage-products";
import styles from "./PopularProducts.module.css";
import StoreProductCard from "./StoreProductCard";
import { getCustomer } from "@/lib/auth";

async function wishlistSet(customerId: number | null): Promise<Set<number>> {
  if (!customerId) return new Set();
  const data = await serverApiGet<{ items: { product_id: number }[] }>("/storefront/wishlist");
  const ids = data?.items?.map((i) => i.product_id) || [];
  return new Set(ids);
}

export default async function PopularProducts() {
  const [products, customer] = await Promise.all([
    fetchStorefrontProductsWithFallback(
      { sort: "best_sellers", limit: 10 },
      [{ sort: "newest", limit: 10 }],
    ),
    getCustomer(),
  ]);
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
          })
        )}
      </div>
    </section>
  );
}
