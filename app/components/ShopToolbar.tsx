"use client";

import { useState, useCallback, cloneElement, isValidElement, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { ShopQueryState } from "@/lib/shop-query";
import { shopPathFromState } from "@/lib/shop-query";
import FilterDrawer from "./FilterDrawer";
import styles from "../shop/shop.module.css";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "best_sellers", label: "Best sellers" },
] as const;

const LIMIT_OPTIONS = ["10", "15", "24", "48"] as const;

type Props = {
  state: ShopQueryState;
  total: number;
  activeFilterCount: number;
  filterPanel: ReactElement<{ onClose?: () => void }>;
};

export default function ShopToolbar({ state, total, activeFilterCount, filterPanel }: Props) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const base = useCallback(
    (overrides: Partial<ShopQueryState>): ShopQueryState => ({
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

  const onSortChange = (sort: string) => {
    router.push(shopPathFromState(base({ sort, page: "1" })));
  };

  const onLimitChange = (limit: string) => {
    router.push(shopPathFromState(base({ limit, page: "1" })));
  };

  const panelWithClose = isValidElement(filterPanel)
    ? cloneElement(filterPanel, { onClose: closeDrawer })
    : filterPanel;

  return (
    <>
      <div className={`${styles.toolbar}`}>
        <button type="button" className={styles.filterTrigger} onClick={() => setDrawerOpen(true)} aria-expanded={drawerOpen}>
          <span className={styles.filterIcon} aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </span>
          Filters
          {activeFilterCount > 0 ? <span className={styles.filterBadge}>{activeFilterCount}</span> : null}
        </button>

        <div className={styles.toolbarMeta}>
          <span className={styles.resultCount}>
            {total} product{total === 1 ? "" : "s"}
          </span>
        </div>

        <div className={styles.toolbarControls}>
          <label className={styles.toolbarLabel}>
            <span className={styles.srOnly}>Sort by</span>
            <select
              className={styles.toolbarSelect}
              value={state.sort || "newest"}
              onChange={(e) => onSortChange(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.toolbarLabel}>
            <span className={styles.srOnly}>Per page</span>
            <select
              className={styles.toolbarSelect}
              value={state.limit || "24"}
              onChange={(e) => onLimitChange(e.target.value)}
            >
              {LIMIT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} per page
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <FilterDrawer open={drawerOpen} onClose={closeDrawer} title="Filter">
        {panelWithClose}
      </FilterDrawer>
    </>
  );
}
