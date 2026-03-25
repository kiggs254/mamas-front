"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./CartSidebar.module.css";
import { MinusIcon, PlusIcon } from "./Icons";
import { useCart } from "@/hooks/useCart";
import { apiDelete, apiPut } from "@/lib/api";
import { productPrimaryImage } from "@/lib/products";
import { cartLineUnitPrice, cartSubtotal } from "@/lib/cart";
import type { CartLine, StorefrontProduct } from "@/types/api";

export default function CartSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data, mutate, isLoading } = useCart();
  const items = data?.items || [];

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("openCart", handleOpen);
    return () => window.removeEventListener("openCart", handleOpen);
  }, []);

  const totalAmount = useMemo(() => cartSubtotal(items), [items]);

  const setQty = async (line: CartLine, quantity: number) => {
    if (quantity < 1) return;
    await apiPut(`/storefront/cart/${line.id}`, { quantity });
    await mutate();
  };

  const remove = async (line: CartLine) => {
    await apiDelete(`/storefront/cart/${line.id}`);
    await mutate();
  };

  return (
    <>
      <div className={`${styles.overlay} ${isOpen ? styles.open : ""}`} onClick={() => setIsOpen(false)} />
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <div className={styles.header}>
          <div className={styles.titleBox}>
            <span className={styles.title}>Your Cart</span>
            <span className={styles.count}>{items.length} items</span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.items}>
          {isLoading && <p>Loading cart…</p>}
          {!isLoading && items.length === 0 && <p>Your cart is empty.</p>}
          {items.map((line) => {
            const p = line.product as StorefrontProduct | undefined;
            const name = p?.name || "Item";
            const img = p ? productPrimaryImage(p) : "";
            const unit = cartLineUnitPrice(line);
            return (
              <div key={line.id} className={styles.item}>
                <div className={styles.itemImage}>
                  {img ? (
                    <Image src={img} alt="" width={48} height={48} style={{ objectFit: "contain" }} />
                  ) : (
                    "📦"
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>{name}</div>
                  <div className={styles.itemPrice}>KES {(unit * line.quantity).toFixed(2)}</div>
                  <div className={styles.qtyRow}>
                    <div className={styles.qtyBox}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() => setQty(line, line.quantity - 1)}
                        disabled={line.quantity <= 1}
                      >
                        <MinusIcon size={12} />
                      </button>
                      <input type="number" className={styles.qtyInput} value={line.quantity} readOnly />
                      <button type="button" className={styles.qtyBtn} onClick={() => setQty(line, line.quantity + 1)}>
                        <PlusIcon size={12} />
                      </button>
                    </div>
                    <button type="button" className={styles.removeBtn} onClick={() => remove(line)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.footer}>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span className={styles.totalAmount}>KES {totalAmount.toFixed(2)}</span>
          </div>
          <div className={styles.actionBtns}>
            <Link href="/cart" className={`${styles.btn} ${styles.btnViewCart}`} onClick={() => setIsOpen(false)}>
              View Cart
            </Link>
            <Link href="/checkout" className={`${styles.btn} ${styles.btnCheckout}`} onClick={() => setIsOpen(false)}>
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
