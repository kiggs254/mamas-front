"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { StarIcon, CartIcon } from "./Icons";
import AddToCartButton from "./AddToCartButton";
import styles from "./DailyBestSells.module.css";
import { useCurrency } from "./CurrencyContext";

export type DailyProduct = {
  id: number;
  name: string;
  href: string;
  imageUrl: string;
  categoryLabel: string;
  price: number;
  oldPrice: number | null;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  variantId?: number | null;
  ageRestricted?: boolean;
  soldCount?: number;
  stockCount?: number;
};

type Props = {
  products: DailyProduct[];
  tabs: string[];
};

function StarRating({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className={styles.cardStars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} size={12} filled={i <= r} />
      ))}
    </div>
  );
}

export default function DailyBestSellsClient({ products, tabs }: Props) {
  const cc = useCurrency();
  const [activeTab, setActiveTab] = useState(tabs[0] ?? "All");
  const trackRef = useRef<HTMLDivElement>(null);

  const VISIBLE = 4;

  const filtered = products; // tab filtering is display-only on static data; extend if needed

  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(filtered.length / VISIBLE));
  const visible = filtered.slice(page * VISIBLE, page * VISIBLE + VISIBLE);

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div className={styles.rightCol}>
      {/* Tabs + arrows */}
      <div className={styles.sliderHeader}>
        <div className={styles.tabsRow}>
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              className={`${styles.tab} ${activeTab === t ? styles.tabActive : ""}`}
              onClick={() => { setActiveTab(t); setPage(0); }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className={styles.arrows}>
          <button type="button" className={styles.arrow} onClick={prev} disabled={page === 0} aria-label="Previous">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button type="button" className={styles.arrow} onClick={next} disabled={page >= totalPages - 1} aria-label="Next">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className={styles.slider} ref={trackRef}>
        {visible.length === 0 ? (
          <p className={styles.empty}>No products yet.</p>
        ) : (
          visible.map((p) => {
            const soldCount = p.soldCount ?? Math.floor(Math.random() * 80 + 20);
            const stockCount = p.stockCount ?? Math.floor(soldCount + Math.random() * 100 + 20);
            const soldPct = Math.min(100, Math.round((soldCount / stockCount) * 100));

            return (
              <div key={p.id} className={styles.dCard}>
                {p.discountPercent > 0 && (
                  <span className={styles.dBadge}>{p.discountPercent}%</span>
                )}

                <Link href={p.href} className={styles.dImageWrap} prefetch={false} aria-label={p.name}>
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt=""
                      width={180}
                      height={160}
                      style={{ objectFit: "contain", maxHeight: "100%", maxWidth: "100%" }}
                    />
                  ) : (
                    <span style={{ fontSize: 40, opacity: 0.3 }}>📦</span>
                  )}
                </Link>

                <div className={styles.dBody}>
                  <p className={styles.dCat}>{p.categoryLabel}</p>
                  <Link href={p.href} className={styles.dName} prefetch={false}>{p.name}</Link>

                  <div className={styles.dRatingRow}>
                    <StarRating rating={p.rating} />
                    <span className={styles.dReviews}>{p.reviewCount}</span>
                  </div>

                  <div className={styles.dPriceRow}>
                    <span className={styles.dPrice}>{cc} {p.price.toFixed(2)}</span>
                    {p.oldPrice != null && (
                      <span className={styles.dOldPrice}>{cc} {p.oldPrice.toFixed(2)}</span>
                    )}
                  </div>

                  <div className={styles.dProgress}>
                    <div className={styles.dProgressLabel}>
                      <span>Sold: {soldCount}/{stockCount}</span>
                      <span>{soldPct}%</span>
                    </div>
                    <div className={styles.dProgressBar}>
                      <div className={styles.dProgressFill} style={{ width: `${soldPct}%` }} />
                    </div>
                  </div>

                  <AddToCartButton
                    productId={p.id}
                    variantId={p.variantId}
                    ageRestricted={p.ageRestricted}
                    productName={p.name}
                    className={styles.dAddBtn}
                    label="Add to cart"
                    cartIconSize={14}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
