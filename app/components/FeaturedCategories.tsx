import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import type { StorefrontCategory } from "@/types/api";
import { resolveMediaUrl } from "@/lib/api-config";
import FeaturedCategoriesCarousel from "./FeaturedCategoriesCarousel";
import styles from "./FeaturedCategories.module.css";

const palette = ["#F2FCE4", "#FFFCEB", "#ECFFEC", "#FEEFEA", "#FFF3EB", "#FFF3FF"];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export default async function FeaturedCategories() {
  const data = await serverApiGet<{ categories: StorefrontCategory[] }>("/storefront/categories");
  const roots = (data?.categories || []).filter((c) => c.parent_id == null);

  if (roots.length === 0) return null;

  const items = roots.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image,
    tileColor: colorFor(cat.name),
  }));

  // 8 or fewer → static grid, no scroll; more than 8 → carousel
  if (items.length <= 8) {
    return (
      <section className={styles.section}>
        <div className="section-title">
          <h2>Featured Categories</h2>
          <div className="tabs">
            <span className="active">All</span>
            <Link href="/shop">Browse shop</Link>
          </div>
        </div>
        <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
          {items.map((cat) => {
            const src = cat.image ? resolveMediaUrl(cat.image) : "";
            const href = cat.slug ? `/shop?category_slug=${encodeURIComponent(cat.slug)}` : "/shop";
            return (
              <Link
                key={cat.id}
                href={href}
                className={styles.card}
                style={{ backgroundColor: cat.tileColor }}
                prefetch={false}
              >
                <div className={styles.cardImageWrap}>
                  {src ? (
                    <Image src={src} alt={cat.name} width={88} height={88} className={styles.cardImage} sizes="128px" />
                  ) : (
                    <span className={styles.cardFallback} aria-hidden>
                      {cat.name.trim().charAt(0).toUpperCase() || "·"}
                    </span>
                  )}
                </div>
                <div className={styles.cardName}>{cat.name}</div>
              </Link>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className="section-title">
        <h2>Featured Categories</h2>
        <div className="tabs">
          <span className="active">All</span>
          <Link href="/shop">Browse shop</Link>
        </div>
      </div>
      <FeaturedCategoriesCarousel categories={items} />
    </section>
  );
}
