"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { StorefrontCategory } from "@/types/api";
import { MenuIcon, UserIcon, HeartIcon, PackageIcon, PhoneIcon, ChevronDownIcon } from "./Icons";
import styles from "./MobileMenu.module.css";

type Props = {
  phone: string;
  signedIn: boolean;
  accountLabel: string;
  categories: StorefrontCategory[];
};

function MobileCategoryBranch({
  cat,
  depth,
  expanded,
  toggle,
  close,
}: {
  cat: StorefrontCategory;
  depth: number;
  expanded: Set<number>;
  toggle: (id: number) => void;
  close: () => void;
}) {
  const href = cat.slug ? `/shop?category_slug=${encodeURIComponent(cat.slug)}` : "/shop";
  const children = Array.isArray(cat.children) ? cat.children : [];
  const hasChildren = children.length > 0;
  const isOpen = expanded.has(cat.id);
  const padLeft = depth > 0 ? 10 + depth * 12 : 6;

  if (!hasChildren) {
    return (
      <Link
        href={href}
        className={depth > 0 ? styles.categorySubLink : styles.categoryLink}
        style={{ paddingLeft: padLeft }}
        prefetch={false}
        onClick={close}
      >
        {cat.name}
      </Link>
    );
  }

  return (
    <div className={styles.mobileCatBranch}>
      <div className={styles.mobileCatRow}>
        <Link
          href={href}
          className={depth > 0 ? styles.categorySubLink : styles.categoryLink}
          style={{ paddingLeft: padLeft }}
          prefetch={false}
          onClick={close}
        >
          {cat.name}
        </Link>
        <button
          type="button"
          className={styles.mobileCatExpand}
          aria-expanded={isOpen}
          aria-label={isOpen ? `Hide subcategories under ${cat.name}` : `Show subcategories under ${cat.name}`}
          onClick={(e) => {
            e.preventDefault();
            toggle(cat.id);
          }}
        >
          <span className={`${styles.mobileCatChevron} ${isOpen ? styles.mobileCatChevronOpen : ""}`}>
            <ChevronDownIcon size={18} color="var(--color-text-light)" />
          </span>
        </button>
      </div>
      {isOpen ? (
        <div className={styles.mobileCatChildren}>
          {children.map((ch) => (
            <MobileCategoryBranch
              key={ch.id}
              cat={ch}
              depth={depth + 1}
              expanded={expanded}
              toggle={toggle}
              close={close}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}


export default function MobileMenu({ phone, signedIn, accountLabel, categories }: Props) {
  const [open, setOpen] = useState(false);
  const [catExpanded, setCatExpanded] = useState<Set<number>>(() => new Set());

  const close = useCallback(() => setOpen(false), []);

  const toggleCatExpand = useCallback((id: number) => {
    setCatExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <div className={styles.menuHost}>
      <button
        type="button"
        className={styles.hamburger}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label="Open menu"
      >
        <MenuIcon size={22} color="currentColor" />
      </button>

      <div
        className={`${styles.overlay} ${open ? styles.open : ""}`}
        aria-hidden={!open}
        onClick={close}
      />

      <div
        id="mobile-nav-panel"
        className={`${styles.panel} ${open ? styles.open : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Menu</h2>
          <button type="button" className={styles.closeBtn} onClick={close} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.scroll}>
          <p className={styles.sectionLabel}>Shop</p>
          <Link href="/shop?on_sale=true" className={styles.navLink} prefetch={false} onClick={close}>
            <span>
              Deals <span className={styles.badgeHot}>Hot</span>
            </span>
          </Link>
          <Link href="/" className={styles.navLink} prefetch={false} onClick={close}>
            Home
          </Link>
          <Link href="/pages/about-us" className={styles.navLink} prefetch={false} onClick={close}>
            About
          </Link>
          <Link href="/shop" className={styles.navLink} prefetch={false} onClick={close}>
            Shop
          </Link>
          <Link href="/brands" className={styles.navLink} prefetch={false} onClick={close}>
            Brands
          </Link>
          <Link href="/subscriptions" className={styles.navLink} prefetch={false} onClick={close}>
            <span>
              Subscriptions <span className={styles.badgeNew}>New</span>
            </span>
          </Link>
          <Link href="/blogs" className={styles.navLink} prefetch={false} onClick={close}>
            Blog
          </Link>
          <Link href="/faqs" className={styles.navLink} prefetch={false} onClick={close}>
            FAQs
          </Link>
          <Link href="/store-locator" className={styles.navLink} prefetch={false} onClick={close}>
            Stores
          </Link>

          {categories.length > 0 ? (
            <>
              <div className={styles.divider} />
              <p className={styles.sectionLabel}>Categories</p>
              <div className={styles.categoryList}>
                {categories.map((cat) => (
                  <MobileCategoryBranch
                    key={cat.id}
                    cat={cat}
                    depth={0}
                    expanded={catExpanded}
                    toggle={toggleCatExpand}
                    close={close}
                  />
                ))}
              </div>
            </>
          ) : null}

          <div className={styles.divider} />
          <p className={styles.sectionLabel}>Account</p>
          <Link
            href={signedIn ? "/account" : "/login"}
            className={styles.accountLink}
            prefetch={false}
            onClick={close}
          >
            <UserIcon size={20} />
            {signedIn ? accountLabel : "Sign in / Register"}
          </Link>
          <Link href="/account/wishlist" className={styles.accountLink} prefetch={false} onClick={close}>
            <HeartIcon size={20} />
            Wishlist
          </Link>
          <Link href="/account/orders" className={styles.accountLink} prefetch={false} onClick={close}>
            <PackageIcon size={20} />
            Order tracking
          </Link>
        </div>

        <div className={styles.footer}>
          <div className={styles.supportLabel}>24/7 Support</div>
          <div className={styles.phoneRow}>
            <PhoneIcon size={22} color="var(--color-primary)" />
            <a href={`tel:${phone.replace(/\s/g, "")}`} className={styles.phoneNumber} onClick={close}>
              {phone}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
