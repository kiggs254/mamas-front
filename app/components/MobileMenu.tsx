"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { StorefrontCategory } from "@/types/api";
import { MenuIcon, UserIcon, HeartIcon, PackageIcon, PhoneIcon, LocationIcon } from "./Icons";
import { headerLocationLabel, readSelectedBranch } from "@/lib/branch-selection";
import { useBranchCartConflictState } from "./BranchCartConflictContext";
import BranchCartWarning from "./BranchCartWarning";
import styles from "./MobileMenu.module.css";

type Props = {
  phone: string;
  signedIn: boolean;
  accountLabel: string;
  categories: StorefrontCategory[];
};

function MobileMenuStorePicker({ onPick }: { onPick: () => void }) {
  const [label, setLabel] = useState(() => headerLocationLabel(readSelectedBranch()));
  const branchCart = useBranchCartConflictState();

  useEffect(() => {
    const sync = () => setLabel(headerLocationLabel(readSelectedBranch()));
    window.addEventListener("locationChange", sync);
    return () => window.removeEventListener("locationChange", sync);
  }, []);

  return (
    <div className={styles.storePickerBlock}>
      <button type="button" className={styles.storePickerBtn} onClick={onPick}>
        <LocationIcon size={20} color="var(--color-primary)" />
        <span className={styles.storePickerLabel}>{label}</span>
      </button>
      {branchCart?.branchesEnabledShop ? (
        <BranchCartWarning
          className={styles.storePickerWarning}
          conflictIds={branchCart.conflictIds}
          checking={branchCart.checking}
          onProceed={branchCart.proceedRemove}
          onDismiss={branchCart.dismiss}
        />
      ) : null}
    </div>
  );
}

export default function MobileMenu({ phone, signedIn, accountLabel, categories }: Props) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

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

  const roots = categories.filter((c) => (c.parent_id ?? null) === null);

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
          <MobileMenuStorePicker
            onPick={() => {
              close();
              window.setTimeout(() => window.dispatchEvent(new Event("openLocationPicker")), 0);
            }}
          />
          <div className={styles.divider} />
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
          <Link href="/recipes" className={styles.navLink} prefetch={false} onClick={close}>
            Recipes
          </Link>
          <Link href="/faqs" className={styles.navLink} prefetch={false} onClick={close}>
            FAQs
          </Link>
          <Link href="/store-locator" className={styles.navLink} prefetch={false} onClick={close}>
            Stores
          </Link>

          {roots.length > 0 ? (
            <>
              <div className={styles.divider} />
              <p className={styles.sectionLabel}>Categories</p>
              <div className={styles.categoryList}>
                {roots.map((cat) => {
                  const href = cat.slug
                    ? `/shop?category_slug=${encodeURIComponent(cat.slug)}`
                    : "/shop";
                  return (
                    <Link
                      key={cat.id}
                      href={href}
                      className={styles.categoryLink}
                      prefetch={false}
                      onClick={close}
                    >
                      {cat.name}
                    </Link>
                  );
                })}
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
