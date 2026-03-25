import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import { resolveMediaUrl } from "@/lib/api-config";
import type { StorefrontCategory } from "@/types/api";
import styles from "./FeaturedCategories.module.css";

const palette = ["#F2FCE4", "#FFFCEB", "#ECFFEC", "#FEEFEA", "#FFF3EB", "#FFF3FF"];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export default async function FeaturedCategories() {
  const data = await serverApiGet<{ categories: StorefrontCategory[] }>("/storefront/categories");
  const roots = data?.categories || [];

  return (
    <section className={styles.section}>
      <div className="section-title">
        <h2>Featured Categories</h2>
        <div className="tabs">
          <span className="active">All</span>
          <Link href="/shop">Browse shop</Link>
        </div>
      </div>
      <div className={styles.grid}>
        {roots.length === 0 ? (
          <p style={{ gridColumn: "1/-1" }}>No categories yet.</p>
        ) : (
          roots.map((cat) => {
            const src = cat.image ? resolveMediaUrl(cat.image) : "";
            return (
              <Link
                key={cat.id}
                href={cat.slug ? `/shop?category_slug=${encodeURIComponent(cat.slug)}` : "/shop"}
                className={styles.card}
                style={{ backgroundColor: colorFor(cat.name) }}
                prefetch={false}
              >
                <div className={styles.cardImageWrap}>
                  {src ? (
                    <Image
                      src={src}
                      alt={cat.name}
                      width={88}
                      height={88}
                      className={styles.cardImage}
                      sizes="88px"
                    />
                  ) : (
                    <span className={styles.cardFallback} aria-hidden>
                      {cat.name.trim().charAt(0).toUpperCase() || "·"}
                    </span>
                  )}
                </div>
                <div className={styles.cardName}>{cat.name}</div>
                <div className={styles.cardCount}>
                  {Array.isArray(cat.children) ? cat.children.length : 0} subcategories
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
