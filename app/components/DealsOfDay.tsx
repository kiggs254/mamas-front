import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import type { StorefrontProduct } from "@/types/api";
import { productEffectivePrice, productHref, productPrimaryImage, productRatingApprox } from "@/lib/products";
import styles from "./DealsOfDay.module.css";
import { StarIcon } from "./Icons";
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

export default async function DealsOfDay() {
  const data = await serverApiGet<{ products: StorefrontProduct[] }>(
    "/storefront/products?on_sale=true&limit=8"
  );
  const products = data?.products || [];

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
            const v0 = product.variants?.[0];
            return (
              <div key={product.id} className={styles.card}>
                <Link href={href} className={styles.imageWrap} prefetch={false}>
                  {img ? (
                    <Image src={img} alt="" width={180} height={180} style={{ objectFit: "contain" }} />
                  ) : (
                    <span>🏷️</span>
                  )}
                </Link>
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
    </section>
  );
}
