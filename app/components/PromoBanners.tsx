import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import type { Banner } from "@/types/api";
import { resolveMediaUrl } from "@/lib/api-config";
import styles from "./PromoBanners.module.css";
import { ArrowRightIcon } from "./Icons";

const DEFAULT_TITLES = ["Everyday fresh products", "Breakfast & beverages", "Organic selection"];

function bannerHref(b: Banner): string {
  const raw = (b.link ?? b.link_url ?? "").trim();
  if (!raw) return "/shop";
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/")) return raw;
  return `/${raw}`;
}

export default async function PromoBanners() {
  const data = await serverApiGet<{ banners: Banner[] }>("/storefront/banners?position=middle");
  const middle = (data?.banners || []).filter((b) => b.image_url && String(b.image_url).trim());

  const slots = [0, 1, 2].map((i) => middle[i] ?? null);

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        {slots.map((b, i) => {
          const title = b?.title?.trim() || DEFAULT_TITLES[i];
          const href = b ? bannerHref(b) : "/shop";
          const bg = b?.image_url ? resolveMediaUrl(b.image_url) : `/images/promo-banner-${(i % 3) + 1}.png`;
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
