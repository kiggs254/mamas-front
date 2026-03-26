"use client";

import { useRef, useEffect, useState, useCallback, useLayoutEffect, Children } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";
import styles from "./FeaturedProducts.module.css";

const CARD_MIN_PX = 240;
const GAP_PX = 12;
const SCROLL_MS = 900;

type Props = {
  children: React.ReactNode;
};

function visibleScrollWidth(viewport: HTMLElement): number {
  const cs = getComputedStyle(viewport);
  const pl = parseFloat(cs.paddingLeft) || 0;
  const pr = parseFloat(cs.paddingRight) || 0;
  return Math.max(0, viewport.clientWidth - pl - pr);
}

export default function FeaturedProductsSlider({ children }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const childCount = Children.count(children);

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
    const first = track.firstElementChild as HTMLElement | null;
    const cardW = first && first.offsetWidth > 0 ? first.offsetWidth : CARD_MIN_PX;
    const innerW = visibleScrollWidth(el);
    const step = Math.max(cardW + GAP_PX, Math.floor(innerW * 0.55));
    smoothScrollTo(el.scrollLeft + dir * step);
  };

  useLayoutEffect(() => {
    updateArrows();
  }, [childCount, updateArrows]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport) return;
    const ro = new ResizeObserver(() => {
      updateArrows();
    });
    ro.observe(viewport);
    if (track) ro.observe(track);
    const id = window.requestAnimationFrame(() => updateArrows());
    const t = window.setTimeout(() => updateArrows(), 150);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(id);
      window.clearTimeout(t);
      stopScrollAnim();
    };
  }, [childCount, updateArrows, stopScrollAnim]);

  if (childCount === 0) {
    return null;
  }

  return (
    <div className={styles.carouselWrap}>
      <div className={styles.carouselViewportOuter}>
        <button
          type="button"
          className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
          onClick={() => scrollByDir(-1)}
          disabled={!canPrev}
          aria-label="Previous products"
        >
          <ChevronLeftIcon size={22} color="currentColor" />
        </button>
        <button
          type="button"
          className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
          onClick={() => scrollByDir(1)}
          disabled={!canNext}
          aria-label="Next products"
        >
          <ChevronRightIcon size={22} color="currentColor" />
        </button>
        <div
          ref={viewportRef}
          className={styles.carouselViewport}
          onScroll={updateArrows}
          tabIndex={0}
          role="region"
          aria-label="Featured products"
        >
          <div ref={trackRef} className={styles.carouselTrack}>
            {children}
            <div className={styles.carouselEndSpacer} aria-hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
