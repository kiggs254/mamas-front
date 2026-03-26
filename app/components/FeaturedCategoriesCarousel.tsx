"use client";

import { useRef, useEffect, useState, useCallback, useLayoutEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { resolveMediaUrl } from "@/lib/api-config";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";
import styles from "./FeaturedCategories.module.css";

const CARD_MIN_PX = 128;
const GAP_PX = 15;
const SCROLL_MS = 900;

export type FeaturedCategoryItem = {
  id: number;
  name: string;
  slug?: string;
  image?: string | null;
  tileColor: string;
};

type Props = {
  categories: FeaturedCategoryItem[];
};

/** Visible inner width of scroll area (excludes horizontal padding on viewport). */
function visibleScrollWidth(viewport: HTMLElement): number {
  const cs = getComputedStyle(viewport);
  const pl = parseFloat(cs.paddingLeft) || 0;
  const pr = parseFloat(cs.paddingRight) || 0;
  return Math.max(0, viewport.clientWidth - pl - pr);
}

export default function FeaturedCategoriesCarousel({ categories }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateEndSpacer = useCallback(() => {
    const spacer = spacerRef.current;
    if (spacer) {
      spacer.style.width = "0px";
      spacer.style.minWidth = "0px";
    }
  }, []);

  const updateArrows = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = Math.max(0, scrollWidth - clientWidth);
    setCanPrev(scrollLeft > 4);
    setCanNext(scrollLeft < max - 4);
  }, []);

  const stopScrollAnim = useCallback(() => {
    if (scrollAnimRef.current != null) {
      cancelAnimationFrame(scrollAnimRef.current);
      scrollAnimRef.current = null;
    }
  }, []);

  const smoothScrollTo = useCallback(
    (targetLeft: number) => {
      const el = viewportRef.current;
      if (!el) return;
      stopScrollAnim();
      const max = Math.max(0, el.scrollWidth - el.clientWidth);
      const target = Math.max(0, Math.min(max, targetLeft));
      const start = el.scrollLeft;
      const dist = target - start;
      if (Math.abs(dist) < 0.5) {
        updateArrows();
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        const u = Math.min(1, (now - t0) / SCROLL_MS);
        const eased = 1 - Math.pow(1 - u, 3);
        el.scrollLeft = start + dist * eased;
        if (u < 1) {
          scrollAnimRef.current = requestAnimationFrame(tick);
        } else {
          scrollAnimRef.current = null;
          el.scrollLeft = target;
          updateArrows();
        }
      };
      scrollAnimRef.current = requestAnimationFrame(tick);
    },
    [stopScrollAnim, updateArrows],
  );

  const scrollByDir = (dir: -1 | 1) => {
    const el = viewportRef.current;
    const track = trackRef.current;
    if (!el || !track) return;
    const first = track.querySelector("a");
    const cardW =
      first instanceof HTMLElement && first.offsetWidth > 0
        ? first.offsetWidth
        : CARD_MIN_PX;
    const innerW = visibleScrollWidth(el);
    const step = Math.max(cardW + GAP_PX, Math.floor(innerW * 0.55));
    smoothScrollTo(el.scrollLeft + dir * step);
  };

  useLayoutEffect(() => {
    updateEndSpacer();
    updateArrows();
  }, [categories.length, updateEndSpacer, updateArrows]);

  const onCategoryImageLoaded = useCallback(() => {
    requestAnimationFrame(() => {
      updateEndSpacer();
      updateArrows();
    });
  }, [updateEndSpacer, updateArrows]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport) return;
    const ro = new ResizeObserver(() => {
      updateEndSpacer();
      updateArrows();
    });
    ro.observe(viewport);
    if (track) ro.observe(track);
    const id = window.requestAnimationFrame(() => {
      updateEndSpacer();
      updateArrows();
    });
    const t = window.setTimeout(() => {
      updateEndSpacer();
      updateArrows();
    }, 150);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(id);
      window.clearTimeout(t);
      stopScrollAnim();
    };
  }, [categories.length, updateEndSpacer, updateArrows, stopScrollAnim]);

  if (categories.length === 0) {
    return <p className={styles.empty}>No categories yet.</p>;
  }

  return (
    <div className={styles.carouselWrap}>
      <div className={styles.carouselViewportOuter}>
        <button
          type="button"
          className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
          onClick={() => scrollByDir(-1)}
          disabled={!canPrev}
          aria-label="Previous categories"
        >
          <ChevronLeftIcon size={22} color="currentColor" />
        </button>
        <button
          type="button"
          className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
          onClick={() => scrollByDir(1)}
          disabled={!canNext}
          aria-label="Next categories"
        >
          <ChevronRightIcon size={22} color="currentColor" />
        </button>
        <div
          ref={viewportRef}
          className={styles.carouselViewport}
          onScroll={updateArrows}
          tabIndex={0}
          role="region"
          aria-label="Category list"
        >
          <div ref={trackRef} className={styles.carouselTrack}>
            {categories.map((cat) => {
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
                      <Image
                        src={src}
                        alt={cat.name}
                        width={88}
                        height={88}
                        className={styles.cardImage}
                        sizes="128px"
                        onLoadingComplete={onCategoryImageLoaded}
                      />
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
            <div ref={spacerRef} className={styles.carouselEndSpacer} aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
