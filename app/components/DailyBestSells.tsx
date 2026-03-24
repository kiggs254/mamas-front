import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import type { StorefrontProduct } from "@/types/api";
import { productEffectivePrice, productHref, productPrimaryImage, productRatingApprox } from "@/lib/products";
import styles from "./DailyBestSells.module.css";
import { LeafIcon, ArrowRightIcon, StarIcon } from "./Icons";
import AddToCartButton from "./AddToCartButton";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.rating}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} size={12} filled={i <= rating} />
      ))}
    </div>
  );
}

export default async function DailyBestSells() {
  const data = await serverApiGet<{ products: StorefrontProduct[] }>(
    "/storefront/products?sort=best_sellers&limit=6"
  );
  const products = data?.products || [];

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
              const v0 = product.variants?.[0];
              return (
                <div key={product.id} className={styles.card}>
                  <Link href={href} className={styles.imageWrap} prefetch={false}>
                    {img ? (
                      <Image src={img} alt="" width={160} height={160} style={{ objectFit: "contain" }} />
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
                    <AddToCartButton productId={product.id} variantId={v0?.id} className={styles.addBtn} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
