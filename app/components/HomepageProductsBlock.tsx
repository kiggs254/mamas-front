import Link from "next/link";
import type { HomepageSection } from "@/types/api";
import {
  productEffectivePrice,
  productHref,
  productPrimaryImage,
  productRatingApprox,
  productReviewCount,
  productSalePercentOff,
} from "@/lib/products";
import { fetchProductsForHomepageSection } from "@/lib/homepage-section-products";
import { getCustomer } from "@/lib/auth";
import { serverApiGet } from "@/lib/server-api";
import styles from "./FeaturedProducts.module.css";
import gridStyles from "./PopularProducts.module.css";
import StoreProductCard from "./StoreProductCard";
import FeaturedProductsSlider from "./FeaturedProductsSlider";

async function wishlistSet(customerId: number | null): Promise<Set<number>> {
  if (!customerId) return new Set();
  const data = await serverApiGet<{ items: { product_id: number }[] }>("/storefront/wishlist");
  const ids = data?.items?.map((i) => i.product_id) || [];
  return new Set(ids);
}

export default async function HomepageProductsBlock({ section }: { section: HomepageSection }) {
  const products = await fetchProductsForHomepageSection(section.config as Record<string, unknown>);
  const customer = await getCustomer();
  const wl = await wishlistSet(customer?.id ?? null);

  const title = section.title?.trim() || "Products";
  const subtitle = section.subtitle?.trim();
  const layout = section.layout === "grid" ? "grid" : "carousel";

  const renderCard = (product: (typeof products)[0]) => {
    const { price, oldPrice } = productEffectivePrice(product);
    const img = productPrimaryImage(product);
    const href = productHref(product);
    const rating = productRatingApprox(product);
    const reviews = productReviewCount(product);
    const v0 = product.variants?.[0];
    const discount = oldPrice != null ? productSalePercentOff(price, oldPrice) : 0;
    return (
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
        ageRestricted={Boolean(product.age_restricted)}
        initialInWishlist={wl.has(product.id)}
      />
    );
  };

  if (products.length === 0) {
    return (
      <section className={styles.section}>
        <div className="section-title">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p className={styles.subtitleMuted}>{subtitle}</p> : null}
          </div>
        </div>
        <p className={styles.empty}>No products to show yet.</p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className={styles.subtitleMuted}>{subtitle}</p> : null}
        </div>
        <div className="tabs">
          <Link href="/shop" className="active">
            View all
          </Link>
        </div>
      </div>
      {layout === "carousel" ? (
        <FeaturedProductsSlider>
          {products.map((product) => (
            <div key={product.id} className={styles.slide}>
              {renderCard(product)}
            </div>
          ))}
        </FeaturedProductsSlider>
      ) : (
        <div className={gridStyles.grid}>
          {products.map((product) => (
            <div key={product.id}>{renderCard(product)}</div>
          ))}
        </div>
      )}
    </section>
  );
}
