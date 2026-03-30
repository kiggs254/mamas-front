import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import type { HomepageSection, StorefrontCategory } from "@/types/api";
import { resolveMediaUrl } from "@/lib/api-config";
import FeaturedCategoriesCarousel from "./FeaturedCategoriesCarousel";
import { normalizeStorefrontCategoryTree, flattenCategoryTree } from "@/lib/categories";
import styles from "./FeaturedCategories.module.css";

const palette = ["#F2FCE4", "#FFFCEB", "#ECFFEC", "#FEEFEA", "#FFF3EB", "#FFF3FF"];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export default async function FeaturedCategoriesSection({ section }: { section: HomepageSection }) {
  const data = await serverApiGet<{ categories: StorefrontCategory[] }>("/storefront/categories");
  const roots = normalizeStorefrontCategoryTree(data?.categories || []);
  if (roots.length === 0) return null;

  const config = (section.config || {}) as {
    category_ids?: number[];
    limit?: number;
    visible_count?: number;
  };
  const flat = flattenCategoryTree(roots);
  const wantedIds = Array.isArray(config.category_ids) ? config.category_ids.filter((n) => n > 0) : [];
  const limit = typeof config.limit === "number" && config.limit > 0 ? config.limit : 12;

  let picked: StorefrontCategory[];
  if (wantedIds.length > 0) {
    const set = new Set(wantedIds);
    picked = flat.filter((c) => set.has(c.id)).slice(0, limit);
  } else {
    picked = flat.filter((c) => (c.parent_id ?? null) === null).slice(0, limit);
  }

  if (picked.length === 0) return null;

  const title = section.title?.trim() || "Featured Categories";
  const subtitle = section.subtitle?.trim();

  const items = picked.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image,
    tileColor: colorFor(cat.name),
  }));

  const header = (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p style={{ fontSize: 14, color: "var(--color-text-light)", margin: "6px 0 0" }}>{subtitle}</p> : null}
      </div>
      <div className="tabs">
        <span className="active">All</span>
        <Link href="/shop">Browse shop</Link>
      </div>
    </div>
  );

  if (items.length <= 8) {
    return (
      <section className={styles.section}>
        {header}
        <div
          className={styles.grid}
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
        >
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
      {header}
      <FeaturedCategoriesCarousel categories={items} />
    </section>
  );
}
