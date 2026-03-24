import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import { resolveMediaUrl } from "@/lib/api-config";
import type { Banner } from "@/types/api";
import styles from "./PromoBanners.module.css";
import { ArrowRightIcon, LeafIcon, CoffeeIcon, ShoppingBagIcon } from "./Icons";

const fallbacks = [LeafIcon, CoffeeIcon, ShoppingBagIcon];

export default async function PromoBanners() {
  const data = await serverApiGet<{ banners: Banner[] }>("/storefront/banners");
  const all = data?.banners || [];
  const promos = all
    .filter((b) => {
      const p = String(b.position || "").toLowerCase();
      return !p.includes("hero") && !p.includes("main");
    })
    .slice(0, 3);

  const use = promos.length >= 3 ? promos : all.slice(0, 3);

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {(use.length ? use : [null, null, null]).map((b, i) => {
          const Icon = fallbacks[i % fallbacks.length];
          const raw = b?.image_url || (b as { image?: string } | null)?.image;
          const src = raw ? resolveMediaUrl(raw) : "";
          return (
            <div key={b?.id ?? i} className={styles.banner}>
              <div className={styles.bannerIcon}>
                {src ? (
                  <Image src={src} alt={b?.title || ""} width={80} height={80} style={{ objectFit: "contain" }} />
                ) : (
                  <Icon size={80} color="var(--color-primary)" />
                )}
              </div>
              <h3 className={styles.bannerTitle}>
                {b?.title || ["Everyday fresh products", "Breakfast & beverages", "Organic selection"][i]}
              </h3>
              {b?.link_url ? (
                <Link href={b.link_url} className={styles.bannerBtn} prefetch={false}>
                  Shop Now <ArrowRightIcon size={14} color="white" />
                </Link>
              ) : (
                <Link href="/shop" className={styles.bannerBtn} prefetch={false}>
                  Shop Now <ArrowRightIcon size={14} color="white" />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
