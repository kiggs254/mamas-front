import { serverApiGet } from "@/lib/server-api";
import type { ShopSettings } from "@/types/api";
import styles from "./HeroBanner.module.css";
import HeroLiveSearch from "./HeroLiveSearch";

export default async function HeroBanner() {
  const settingsData = await serverApiGet<{ settings: ShopSettings }>("/storefront/settings");
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
        <HeroLiveSearch />
      </div>
    </section>
  );
}
