"use client";

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import type { StorefrontCategory } from "@/types/api";
import { resolveMediaUrl } from "@/lib/api-config";
import headerStyles from "./Header.module.css";
import styles from "./BrowseCategoriesDropdown.module.css";
import { MenuIcon, ChevronDownIcon, ChevronRightIcon } from "./Icons";

type Props = {
  categories: StorefrontCategory[];
};

type PanelPos = { top: number; left: number };

export default function BrowseCategoriesDropdown({ categories }: Props) {
  const [open, setOpen] = useState(false);
  const [panelPos, setPanelPos] = useState<PanelPos>({ top: 0, left: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  const updatePanelPosition = useCallback(() => {
    const trigger = wrapRef.current;
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    const panelW = Math.min(380, Math.max(280, window.innerWidth - 24));
    let left = r.left;
    if (left + panelW > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - panelW - 12);
    }
    setPanelPos({ top: r.bottom + 8, left });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePanelPosition();
    const onWin = () => updatePanelPosition();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={`${headerStyles.browseBtn} ${styles.toggle}`}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="browse-categories-panel"
        id="browse-categories-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <MenuIcon size={16} color="white" />
        Browse All Categories
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
          <ChevronDownIcon size={18} color="white" />
        </span>
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              className={styles.panel}
              id="browse-categories-panel"
              role="menu"
              aria-labelledby="browse-categories-trigger"
              style={{
                position: "fixed",
                top: panelPos.top,
                left: panelPos.left,
              }}
            >
              <div className={styles.panelHeader}>Shop by category</div>
              {categories.length === 0 ? (
                <p className={styles.empty}>No categories are available yet.</p>
              ) : (
                <ul className={styles.list}>
                  {categories.map((cat) => {
                    const href = cat.slug
                      ? `/shop?category_slug=${encodeURIComponent(cat.slug)}`
                      : "/shop";
                    const childCount = Array.isArray(cat.children) ? cat.children.length : 0;
                    const src = cat.image ? resolveMediaUrl(cat.image) : "";
                    return (
                      <li key={cat.id} role="none">
                        <Link
                          href={href}
                          className={styles.link}
                          role="menuitem"
                          prefetch={false}
                          onClick={close}
                        >
                          <span className={styles.thumb} aria-hidden>
                            {src ? (
                              <Image
                                src={src}
                                alt=""
                                width={40}
                                height={40}
                                sizes="40px"
                                style={{ objectFit: "contain" }}
                              />
                            ) : (
                              <span className={styles.thumbFallback}>
                                {cat.name.trim().charAt(0).toUpperCase() || "·"}
                              </span>
                            )}
                          </span>
                          <span className={styles.linkLabel}>
                            {cat.name}
                            {childCount > 0 ? (
                              <span className={styles.linkMeta}>
                                {" "}
                                · {childCount} sub{childCount === 1 ? "category" : "categories"}
                              </span>
                            ) : null}
                          </span>
                          <ChevronRightIcon size={16} color="var(--color-text-light)" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className={styles.footer}>
                <Link href="/shop" className={styles.footerLink} prefetch={false} onClick={close}>
                  View all products
                </Link>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
