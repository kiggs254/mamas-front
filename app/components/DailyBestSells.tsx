import Image from "next/image";
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
import styles from "./DailyBestSells.module.css";
import { ArrowRightIcon } from "./Icons";
import { getCustomer } from "@/lib/auth";
import DailyBestSellsClient, { type DailyProduct } from "./DailyBestSellsClient";

const TABS = ["All", "On Sale", "Beauty", "Bread & Juice", "Drinks", "Milks"];

export default async function DailyBestSells() {
  const [products, customer] = await Promise.all([
    fetchStorefrontProductsWithFallback(
      { on_sale: true, limit: 12 },
      [{ sort: "best_sellers", limit: 12 }, { sort: "newest", limit: 12 }],
    ),
    getCustomer(),
  ]);

  const wlData =
    customer &&
    (await serverApiGet<{ items: { product_id: number }[] }>("/storefront/wishlist"));
  const wl = new Set(wlData?.items?.map((i) => i.product_id) || []);

  const dailyProducts: DailyProduct[] = products.map((product) => {
    const { price, oldPrice } = productEffectivePrice(product);
    const discount = oldPrice != null ? productSalePercentOff(price, oldPrice) : 0;
    return {
      id: product.id,
      name: product.name,
      href: productHref(product),
      imageUrl: productPrimaryImage(product),
      categoryLabel: product.category?.name || "—",
      price,
      oldPrice: oldPrice ?? null,
      discountPercent: discount,
      rating: productRatingApprox(product),
      reviewCount: productReviewCount(product),
      variantId: product.variants?.[0]?.id,
      ageRestricted: Boolean(product.age_restricted),
      soldCount: product.sold_count ?? undefined,
      stockCount: product.stock ?? product.quantity ?? undefined,
    };
  });

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        {/* Left banner */}
        <div className={styles.banner}>
          <Image
            src="/images/daily-best-banner.png"
            alt="Daily Best Sells"
            fill
            className={styles.bannerImg}
            sizes="280px"
            priority
          />
          <div className={styles.bannerOverlay} />
          <div className={styles.bannerText}>
            <h3 className={styles.bannerTitle}>Bring nature into your home</h3>
            <Link href="/shop" className={styles.bannerBtn} prefetch={false}>
              Shop Now <ArrowRightIcon size={14} color="white" />
            </Link>
          </div>
        </div>

        {/* Right: tabs + slider */}
        <DailyBestSellsClient products={dailyProducts} tabs={TABS} />
      </div>
    </section>
  );
}
