import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
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
          roots.map((cat) => (
            <Link
              key={cat.id}
              href={cat.slug ? `/shop?category_slug=${encodeURIComponent(cat.slug)}` : "/shop"}
              className={styles.card}
              style={{ backgroundColor: colorFor(cat.name) }}
              prefetch={false}
            >
              <span className={styles.cardIcon}>🛒</span>
              <div className={styles.cardName}>{cat.name}</div>
              <div className={styles.cardCount}>
                {Array.isArray(cat.children) ? cat.children.length : 0} subcategories
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
