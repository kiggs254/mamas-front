import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import { resolveMediaUrl } from "@/lib/api-config";
import type { Banner, ShopSettings } from "@/types/api";
import styles from "./HeroBanner.module.css";
import { SearchIcon, ArrowRightIcon } from "./Icons";

export default async function HeroBanner() {
  const [bannerData, settingsData] = await Promise.all([
    serverApiGet<{ banners: Banner[] }>("/storefront/banners?position=hero"),
    serverApiGet<{ settings: ShopSettings }>("/storefront/settings"),
  ]);

  const banners = bannerData?.banners || [];
  const shopName = settingsData?.settings?.shop_name || "Cleanshelf Supermarket";
  const tagline = settingsData?.settings?.shop_description || "Save on fresh produce and daily essentials";

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>
          Welcome to {shopName}
          <br />
          Shop more for less
        </h1>
        <p>{tagline}</p>
        <form action="/shop" method="get" className={styles.heroSearch}>
          <span style={{ display: "flex", alignItems: "center", marginLeft: 12 }}>
            <SearchIcon size={18} color="#7e7e7e" />
          </span>
          <input type="text" name="q" placeholder="Search for items..." />
          <button type="submit">
            Shop Now <ArrowRightIcon size={14} color="white" />
          </button>
        </form>
        {banners.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 20,
              flexWrap: "wrap",
              position: "relative",
              zIndex: 2,
            }}
          >
            {banners.slice(0, 4).map((b) => {
              const raw = b.image_url || (b as { image?: string }).image;
              if (!raw) return null;
              const src = resolveMediaUrl(raw);
              const inner = (
                <Image
                  src={src}
                  alt={b.title || "Promo"}
                  width={140}
                  height={80}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
              );
              return b.link_url ? (
                <Link key={b.id} href={b.link_url}>
                  {inner}
                </Link>
              ) : (
                <span key={b.id}>{inner}</span>
              );
            })}
          </div>
        )}
      </div>
      <div className={styles.heroSlider}>
        <span className={`${styles.heroDot} ${styles.active}`} />
        <span className={styles.heroDot} />
        <span className={styles.heroDot} />
      </div>
    </section>
  );
}
