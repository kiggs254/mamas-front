import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import { resolveMediaUrl } from "@/lib/api-config";
import FeaturedProductsSlider from "./FeaturedProductsSlider";
import styles from "./FeaturedProducts.module.css";
import brandStyles from "./BrandsSection.module.css";

type Brand = { id: number; name: string; slug?: string; logo?: string | null };

export default async function BrandsSection({
  title = "Shop by brand",
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const data = await serverApiGet<{ brands: Brand[] }>("/storefront/brands");
  const brands = (data?.brands || []).filter((b) => b.name);

  if (brands.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className={brandStyles.subtitle}>{subtitle}</p> : null}
        </div>
        <div className="tabs">
          <Link href="/shop" className="active">
            View all
          </Link>
        </div>
      </div>
      <FeaturedProductsSlider>
        {brands.map((b) => {
          const href = b.slug ? `/shop?brand_slug=${encodeURIComponent(b.slug)}` : "/shop";
          const logo = b.logo ? resolveMediaUrl(b.logo) : "";
          return (
            <div key={b.id} className={brandStyles.brandSlide}>
              <Link href={href} className={brandStyles.brandCard} prefetch={false}>
                <div className={brandStyles.brandLogoWrap}>
                  {logo ? (
                    <Image
                      src={logo}
                      alt=""
                      width={120}
                      height={64}
                      className={brandStyles.brandLogo}
                      sizes="120px"
                    />
                  ) : (
                    <span className={brandStyles.brandFallback} aria-hidden>
                      {b.name.trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className={brandStyles.brandName}>{b.name}</span>
              </Link>
            </div>
          );
        })}
      </FeaturedProductsSlider>
    </section>
  );
}
