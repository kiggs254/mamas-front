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
import { getCustomer } from "@/lib/auth";
import styles from "./FeaturedProducts.module.css";
import StoreProductCard from "./StoreProductCard";
import FeaturedProductsSlider from "./FeaturedProductsSlider";

async function wishlistSet(customerId: number | null): Promise<Set<number>> {
  if (!customerId) return new Set();
  const data = await serverApiGet<{ items: { product_id: number }[] }>("/storefront/wishlist");
  const ids = data?.items?.map((i) => i.product_id) || [];
  return new Set(ids);
}

export default async function FeaturedProducts() {
  const [products, customer] = await Promise.all([
    fetchStorefrontProductsWithFallback(
      { featured: true, limit: 12 },
      [{ sort: "best_sellers", limit: 12 }, { sort: "newest", limit: 12 }],
    ),
    getCustomer(),
  ]);
  const wl = await wishlistSet(customer?.id ?? null);

  return (
    <section className={styles.section}>
      <div className="section-title">
        <h2>Featured Products</h2>
        <div className="tabs">
          <Link href="/shop?featured=true" className="active">
            View all
          </Link>
        </div>
      </div>
      {products.length === 0 ? (
        <p className={styles.empty}>No products to show yet.</p>
      ) : (
        <FeaturedProductsSlider>
          {products.map((product) => {
            const { price, oldPrice } = productEffectivePrice(product);
            const img = productPrimaryImage(product);
            const href = productHref(product);
            const rating = productRatingApprox(product);
            const reviews = productReviewCount(product);
            const v0 = product.variants?.[0];
            const discount = oldPrice != null ? productSalePercentOff(price, oldPrice) : 0;
            return (
              <div key={product.id} className={styles.slide}>
                <StoreProductCard
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
              </div>
            );
          })}
        </FeaturedProductsSlider>
      )}
    </section>
  );
}
