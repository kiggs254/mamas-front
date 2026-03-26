import Link from "next/link";
import Image from "next/image";
import type { StorefrontProduct } from "@/types/api";
import { productEffectivePrice, productHref, productPrimaryImage, productRatingApprox } from "@/lib/products";
import {
  fetchStorefrontProducts,
  fetchStorefrontProductsWithFallback,
} from "@/lib/homepage-products";
import styles from "./ProductLists.module.css";
import { StarIcon } from "./Icons";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.miniRating}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} size={10} filled={i <= rating} />
      ))}
    </div>
  );
}

function ProductColumn({ title, products }: { title: string; products: StorefrontProduct[] }) {
  return (
    <div className={styles.column}>
      <h3>{title}</h3>
      {products.length === 0 ? (
        <p style={{ fontSize: 13 }}>No items</p>
      ) : (
        products.map((product) => {
          const { price, oldPrice } = productEffectivePrice(product);
          const img = productPrimaryImage(product);
          const href = productHref(product);
          const rating = productRatingApprox(product);
          return (
            <Link key={product.id} href={href} className={styles.miniCard} prefetch={false}>
              <div className={styles.miniImage}>
                {img ? (
                  <Image src={img} alt="" width={56} height={56} style={{ objectFit: "contain" }} />
                ) : (
                  "📦"
                )}
              </div>
              <div className={styles.miniInfo}>
                <div className={styles.miniName}>{product.name}</div>
                <StarRating rating={rating} />
                <div>
                  <span className={styles.miniPrice}>KES {price.toFixed(2)}</span>
                  {oldPrice != null && (
                    <span className={styles.miniOldPrice}>KES {oldPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}

export default async function ProductLists() {
  const [topSelling, trending, recent, topRated] = await Promise.all([
    fetchStorefrontProductsWithFallback({ sort: "best_sellers", limit: 5 }, [{ sort: "newest", limit: 5 }]),
    fetchStorefrontProductsWithFallback({ featured: true, limit: 5 }, [{ sort: "newest", limit: 5 }]),
    fetchStorefrontProducts({ sort: "newest", limit: 5 }),
    fetchStorefrontProductsWithFallback({ sort: "price_desc", limit: 5 }, [{ sort: "newest", limit: 5 }]),
  ]);

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <ProductColumn title="Top Selling" products={topSelling} />
        <ProductColumn title="Trending (new)" products={trending} />
        <ProductColumn title="Recently Added" products={recent} />
        <ProductColumn title="Premium picks" products={topRated} />
      </div>
    </section>
  );
}
