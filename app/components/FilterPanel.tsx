"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import type { ShopQueryState } from "@/lib/shop-query";
import { shopPathFromState } from "@/lib/shop-query";
import styles from "./FilterPanel.module.css";

export type FilterCategoryRow = {
  id: number;
  name: string;
  slug?: string;
};

type Props = {
  categories: FilterCategoryRow[];
  state: ShopQueryState;
  priceHintMin?: number;
  priceHintMax?: number;
  onClose?: () => void;
};

export default function FilterPanel({ categories, state, priceHintMin, priceHintMax, onClose }: Props) {
  const router = useRouter();
  const [minPrice, setMinPrice] = useState(state.min_price || "");
  const [maxPrice, setMaxPrice] = useState(state.max_price || "");

  useEffect(() => {
    setMinPrice(state.min_price || "");
    setMaxPrice(state.max_price || "");
  }, [state.min_price, state.max_price]);

  const push = useCallback(
    (next: ShopQueryState) => {
      router.push(shopPathFromState(next));
      onClose?.();
    },
    [router, onClose],
  );

  const base = useCallback(
    (overrides: Partial<ShopQueryState> = {}): ShopQueryState => ({
      q: state.q,
      search: state.search,
      category_slug: state.category_slug,
      brand_slug: state.brand_slug,
      tag_slug: state.tag_slug,
      sort: state.sort,
      on_sale: state.on_sale,
      featured: state.featured,
      min_price: state.min_price,
      max_price: state.max_price,
      rating: state.rating,
      limit: state.limit,
      page: state.page,
      ...overrides,
    }),
    [state],
  );

  const onCategoryToggle = (slug: string, checked: boolean) => {
    const current = state.category_slug || "";
    if (checked) {
      push(base({ category_slug: slug, page: "1" }));
    } else if (current === slug) {
      push(base({ category_slug: undefined, page: "1" }));
    }
  };

  const onOnSaleChange = (checked: boolean) => {
    push(base({ on_sale: checked ? "true" : undefined, page: "1" }));
  };

  const onRatingChange = (value: string) => {
    push(base({ rating: value || undefined, page: "1" }));
  };

  const onApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    push(
      base({
        min_price: minPrice.trim() || undefined,
        max_price: maxPrice.trim() || undefined,
        page: "1",
      }),
    );
  };

  const searchOnly = (state.search || state.q || "").trim();
  const resetHref = searchOnly ? `/shop?search=${encodeURIComponent(searchOnly)}` : "/shop";

  return (
    <div>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Filter by price</h3>
        <form onSubmit={onApplyPrice}>
          <div className={styles.priceRow}>
            <div className={styles.priceField}>
              <label htmlFor="filter-min-price">Min. Price</label>
              <input
                id="filter-min-price"
                type="number"
                min={0}
                step={1}
                placeholder={priceHintMin != null ? String(Math.floor(priceHintMin)) : "0"}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className={styles.priceField}>
              <label htmlFor="filter-max-price">Max. Price</label>
              <input
                id="filter-max-price"
                type="number"
                min={0}
                step={1}
                placeholder={priceHintMax != null ? String(Math.ceil(priceHintMax)) : "—"}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className={styles.applyBtn}>
            Apply
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Product categories</h3>
        <ul className={styles.catList}>
          {categories.map((cat) => {
            const slug = cat.slug || "";
            const checked = Boolean(slug && state.category_slug === slug);
            return (
              <li key={cat.id}>
                <label className={styles.catRow}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!slug}
                    onChange={(e) => onCategoryToggle(slug, e.target.checked)}
                  />
                  <span className={styles.catName}>{cat.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Rating</h3>
        <select
          className={styles.ratingSelect}
          value={state.rating || ""}
          onChange={(e) => onRatingChange(e.target.value)}
          aria-label="Minimum rating"
        >
          <option value="">Any rating</option>
          <option value="5">5 stars</option>
          <option value="4">4+ stars</option>
          <option value="3">3+ stars</option>
          <option value="2">2+ stars</option>
          <option value="1">1+ stars</option>
        </select>
      </section>

      <section className={styles.section}>
        <label className={styles.row}>
          <input type="checkbox" checked={state.on_sale === "true"} onChange={(e) => onOnSaleChange(e.target.checked)} />
          <span>On sale only</span>
        </label>
      </section>

      <Link href={resetHref} className={styles.resetBtn} prefetch={false} onClick={() => onClose?.()}>
        Reset
      </Link>
    </div>
  );
}
