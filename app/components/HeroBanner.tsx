import { serverApiGet } from "@/lib/server-api";
import type { Banner, ShopSettings } from "@/types/api";
import { resolveMediaUrl } from "@/lib/api-config";
import styles from "./HeroBanner.module.css";
import HeroLiveSearch from "./HeroLiveSearch";
import HeroBannerSlideshow from "./HeroBannerSlideshow";

export default async function HeroBanner() {
  const [settingsData, heroBannerData] = await Promise.all([
    serverApiGet<{ settings: ShopSettings }>("/storefront/settings"),
    serverApiGet<{ banners: Banner[] }>("/storefront/banners?position=hero"),
  ]);

  const shopName = settingsData?.settings?.shop_name || "Mama's Market";
  const tagline = settingsData?.settings?.shop_description || "Your local destination for authentic world flavours";

  const raw = heroBannerData?.banners || [];
  const heroSlides = raw
    .filter((b) => b.image_url && String(b.image_url).trim())
    .map((b) => ({
      id: b.id,
      image: resolveMediaUrl(b.image_url),
      title: b.title,
    }));

  const useBannerBg = heroSlides.length > 0;

  return (
    <section className={`${styles.hero} ${useBannerBg ? styles.heroWithBanners : ""}`}>
      {useBannerBg ? <HeroBannerSlideshow slides={heroSlides} /> : null}
      <div className={styles.heroContent}>
        <h1>
          Welcome to {shopName}
          <br />
          Shop more for less
        </h1>
        <p>{tagline}</p>
        <HeroLiveSearch />
      </div>
    </section>
  );
}
