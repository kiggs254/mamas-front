"use client";

import { useMemo } from "react";
import styles from "./Header.module.css";
import { CartIcon } from "./Icons";
import { useCart } from "@/hooks/useCart";
import { cartSubtotal } from "@/lib/cart";
import { useCurrency } from "./CurrencyContext";

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function HeaderCart() {
  const cc = useCurrency();
  const { data } = useCart();
  const items = data?.items ?? [];
  const subtotal = useMemo(() => cartSubtotal(items), [items]);

  const openCart = () => {
    window.dispatchEvent(new Event("openCart"));
  };

  const countLabel = items.length === 0 ? "empty" : `${items.length} line${items.length === 1 ? "" : "s"}`;

  return (
    <div
      className={styles.headerAction}
      onClick={openCart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && openCart()}
      aria-label={`Shopping cart, ${countLabel}`}
    >
      <span className={styles.icon}>
        <CartIcon size={22} />
      </span>
      <div className={styles.actionText}>
        <span className={styles.actionLabel}>Cart</span>
        <span className={styles.actionValue}>{cc} {formatAmount(subtotal)}</span>
      </div>
    </div>
  );
}
