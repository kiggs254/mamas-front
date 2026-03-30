import Link from "next/link";
import type { HomepageSection, Review } from "@/types/api";
import { serverApiGet } from "@/lib/server-api";
import FeaturedProductsSlider from "./FeaturedProductsSlider";
import fpStyles from "./FeaturedProducts.module.css";
import styles from "./TestimonialsSection.module.css";
import { StarIcon } from "./Icons";

async function fetchReviews(config: Record<string, unknown>): Promise<Review[]> {
  const source = String(config.source || "latest");
  const limit = Math.min(Math.max(Number(config.limit) || 10, 1), 50);

  if (source === "manual" && Array.isArray(config.review_ids) && config.review_ids.length > 0) {
    const ids = (config.review_ids as number[])
      .map((n) => Number(n))
      .filter((n) => n > 0)
      .join(",");
    if (!ids) return [];
    const data = await serverApiGet<{ reviews: Review[] }>(`/storefront/reviews/by-ids?ids=${ids}&limit=${limit}`);
    return data?.reviews ?? [];
  }

  const data = await serverApiGet<{ reviews: Review[] }>(`/storefront/reviews?limit=${limit}`);
  return data?.reviews ?? [];
}

function Stars({ rating }: { rating: number }) {
  const r = Math.round(Math.min(5, Math.max(1, rating)));
  return (
    <div className={styles.stars} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} size={14} filled={i <= r} />
      ))}
    </div>
  );
}

function authorName(r: Review): string {
  const c = r.customer;
  if (!c) return "Customer";
  const f = c.first_name?.trim() || "";
  const l = c.last_name?.trim() || "";
  const name = `${f} ${l}`.trim();
  return name || "Customer";
}

export default async function TestimonialsSection({ section }: { section: HomepageSection }) {
  const config = (section.config || {}) as Record<string, unknown>;
  const reviews = await fetchReviews(config);

  if (reviews.length === 0) return null;

  const title = section.title?.trim() || "What our customers say";
  const subtitle = section.subtitle?.trim();

  return (
    <section className={fpStyles.section}>
      <div className="section-title">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p className={fpStyles.subtitleMuted}>{subtitle}</p> : null}
        </div>
        <div className="tabs">
          <Link href="/shop" className="active">
            Shop
          </Link>
        </div>
      </div>
      <FeaturedProductsSlider>
        {reviews.map((r) => (
          <div key={r.id} className={styles.slide}>
            <blockquote className={styles.card}>
              <Stars rating={r.rating} />
              {r.title ? <p className={styles.quoteTitle}>{r.title}</p> : null}
              <p className={styles.quote}>{r.comment || "—"}</p>
              <footer className={styles.meta}>
                <span className={styles.author}>{authorName(r)}</span>
              </footer>
            </blockquote>
          </div>
        ))}
      </FeaturedProductsSlider>
    </section>
  );
}
