import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import type { Banner } from "@/types/api";
import styles from "./PromoBanners.module.css";
import { ArrowRightIcon } from "./Icons";

const DEFAULT_TITLES = ["Everyday fresh products", "Breakfast & beverages", "Organic selection"];

const PROMO_BACKGROUNDS = [
  "/images/promo-banner-1.png",
  "/images/promo-banner-2.png",
  "/images/promo-banner-3.png",
] as const;

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
        {[0, 1, 2].map((i) => {
          const b = use[i] ?? null;
          const title = b?.title || DEFAULT_TITLES[i];
          const href = b?.link_url?.trim() ? b.link_url : "/shop";
          const bg = PROMO_BACKGROUNDS[i];
          return (
            <div key={b?.id ?? `promo-${i}`} className={styles.banner}>
              <div className={styles.bannerBgWrap} aria-hidden>
                <Image
                  src={bg}
                  alt=""
                  fill
                  className={styles.bannerBg}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority={i === 0}
                />
              </div>
              <div className={styles.bannerInner}>
                <h3 className={styles.bannerTitle}>{title}</h3>
                <Link href={href} className={styles.bannerBtn} prefetch={false}>
                  Shop Now <ArrowRightIcon size={14} color="white" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
