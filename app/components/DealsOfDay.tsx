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
import styles from "./DealsOfDay.module.css";
import StoreProductCard from "./StoreProductCard";
import { getCustomer } from "@/lib/auth";

export default async function DealsOfDay() {
  const [products, customer] = await Promise.all([
    fetchStorefrontProductsWithFallback(
      { on_sale: true, limit: 8 },
      [{ featured: true, limit: 8 }, { sort: "newest", limit: 8 }],
    ),
    getCustomer(),
  ]);

  const wlData =
    customer &&
    (await serverApiGet<{ items: { product_id: number }[] }>("/storefront/wishlist"));
  const wl = new Set(wlData?.items?.map((i) => i.product_id) || []);

  return (
    <section className={styles.section}>
      <div className="section-title">
        <h2>Deals Of The Day</h2>
        <div className="tabs">
          <Link href="/shop?on_sale=true" className="active">
            On sale
          </Link>
        </div>
      </div>
      <div className={styles.grid}>
        {products.length === 0 ? (
          <p style={{ gridColumn: "1/-1" }}>No sale items right now.</p>
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
                ageRestricted={Boolean(product.age_restricted)}
                initialInWishlist={wl.has(product.id)}
              />
            );
          })
        )}
      </div>
    </section>
  );
}
