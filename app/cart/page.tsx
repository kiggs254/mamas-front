"use client";

import Link from "next/link";
import Image from "next/image";
import shell from "../styles/shell.module.css";
import { useCart } from "@/hooks/useCart";
import { apiDelete, apiPut } from "@/lib/api";
import { productPrimaryImage } from "@/lib/products";
import type { CartLine, StorefrontProduct, ProductVariant } from "@/types/api";
import styles from "./cart.module.css";

function lineUnitPrice(line: CartLine): number {
  const v = line.variant as ProductVariant | null | undefined;
  if (v && v.price != null) {
    const vp = Number(v.price);
    const vs = v.sale_price != null ? Number(v.sale_price) : null;
    if (vs != null && !Number.isNaN(vs) && vs > 0 && vs < vp) return vs;
    return vp;
  }
  const p = line.product as StorefrontProduct | undefined;
  if (!p) return 0;
  const sale = p.sale_price != null ? Number(p.sale_price) : null;
  const base = Number(p.price) || 0;
  if (sale != null && sale > 0 && sale < base) return sale;
  return base;
}

export default function CartPage() {
  const { data, mutate, isLoading } = useCart();
  const items = data?.items || [];
  const subtotal = items.reduce((acc, line) => acc + lineUnitPrice(line) * line.quantity, 0);

  const setQty = async (line: CartLine, q: number) => {
    if (q < 1) return;
    await apiPut(`/storefront/cart/${line.id}`, { quantity: q });
    await mutate();
  };

  const remove = async (line: CartLine) => {
    await apiDelete(`/storefront/cart/${line.id}`);
    await mutate();
  };

  return (
    <div className={styles.page}>
      <nav className={shell.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={shell.sep}>/</span>
        <span>Cart</span>
      </nav>

      <div className={styles.hero}>
        <p className={styles.eyebrow}>Basket</p>
        <h1 className={styles.title}>Your cart</h1>
        <div className={styles.titleUnderline} />
        <p className={styles.lead}>Review items and quantities before checkout.</p>
      </div>

      {isLoading && <p className={styles.lead}>Loading…</p>}
      {!isLoading && items.length === 0 && (
        <p className={styles.empty}>
          Your cart is empty. <Link href="/shop">Continue shopping</Link>
        </p>
      )}
      <div className={styles.list}>
        {items.map((line) => {
          const p = line.product as StorefrontProduct | undefined;
          const name = p?.name || "Item";
          const img = p ? productPrimaryImage(p) : "";
          const unit = lineUnitPrice(line);
          return (
            <div key={line.id} className={styles.row}>
              <div className={styles.thumb}>
                {img ? <Image src={img} alt="" width={72} height={72} style={{ objectFit: "contain" }} /> : "📦"}
              </div>
              <div className={styles.info}>
                <Link href={p?.slug ? `/product/${p.slug}` : "#"} className={styles.name}>
                  {name}
                </Link>
                <div className={styles.price}>KES {unit.toFixed(2)} each</div>
                <div className={styles.qty}>
                  <button type="button" onClick={() => setQty(line, line.quantity - 1)} disabled={line.quantity <= 1}>
                    −
                  </button>
                  <span>{line.quantity}</span>
                  <button type="button" onClick={() => setQty(line, line.quantity + 1)}>
                    +
                  </button>
                  <button type="button" className={styles.remove} onClick={() => remove(line)}>
                    Remove
                  </button>
                </div>
              </div>
              <div className={styles.lineTotal}>KES {(unit * line.quantity).toFixed(2)}</div>
            </div>
          );
        })}
      </div>
      {items.length > 0 && (
        <div className={styles.summary}>
          <div className={styles.subtotalRow}>
            <span>Subtotal</span>
            <span>KES {subtotal.toFixed(2)}</span>
          </div>
          <Link href="/checkout" className={styles.checkout}>
            Proceed to checkout
          </Link>
        </div>
      )}
    </div>
  );
}
