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
import styles from "./DailyBestSells.module.css";
import { LeafIcon, ArrowRightIcon } from "./Icons";
import StoreProductCard from "./StoreProductCard";
import { getCustomer } from "@/lib/auth";

export default async function DailyBestSells() {
  const [data, customer] = await Promise.all([
    serverApiGet<{ products: StorefrontProduct[] }>("/storefront/products?sort=best_sellers&limit=6"),
    getCustomer(),
  ]);
  const products = data?.products || [];

  const wlData =
    customer &&
    (await serverApiGet<{ items: { product_id: number }[] }>("/storefront/wishlist"));
  const wl = new Set(wlData?.items?.map((i) => i.product_id) || []);

  return (
    <section className={styles.section}>
      <div className="section-title">
        <h2>Daily Best Sells</h2>
        <div className="tabs">
          <Link href="/shop?sort=best_sellers" className="active">
            Best sellers
          </Link>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.banner}>
          <div className={styles.bannerIconWrap}>
            <LeafIcon size={100} color="var(--color-primary)" />
          </div>
          <h3 className={styles.bannerTitle}>Bring nature into your home</h3>
          <Link href="/shop" className={styles.bannerBtn} prefetch={false}>
            Shop Now <ArrowRightIcon size={14} color="white" />
          </Link>
        </div>
        <div className={styles.slider}>
          {products.length === 0 ? (
            <p>No products yet.</p>
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
      </div>
    </section>
  );
}
