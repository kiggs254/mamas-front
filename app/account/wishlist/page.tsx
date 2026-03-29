import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import { resolveMediaUrl } from "@/lib/api-config";
import type { StorefrontProduct } from "@/types/api";
import { productEffectivePrice, productHref } from "@/lib/products";
import WishlistItemActions from "./WishlistItemActions";
import styles from "./wishlist.module.css";

export default async function WishlistPage() {
  const data = await serverApiGet<{ items: { id: number; product_id: number; product?: StorefrontProduct }[] }>(
    "/storefront/wishlist"
  );
  const items = data?.items || [];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>My Wishlist</h1>
        <p className={styles.subtitle}>{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h3>Your wishlist is empty</h3>
          <p>Browse our products and save your favorites here.</p>
          <Link href="/shop" className={styles.shopBtn}>Browse products</Link>
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map((row) => {
            const p = row.product;
            if (!p) return null;
            const { price, oldPrice } = productEffectivePrice(p);
            const img = p.images?.[0]?.url ? resolveMediaUrl(p.images[0].url) : null;
            const href = productHref(p);
            return (
              <li key={row.id} className={styles.card}>
                <Link href={href} className={styles.thumb} prefetch={false}>
                  {img ? (
                    <Image src={img} alt={p.name} width={100} height={100} style={{ objectFit: "contain" }} />
                  ) : (
                    <div className={styles.noImg}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
                    </div>
                  )}
                </Link>
                <div className={styles.body}>
                  <Link href={href} className={styles.name} prefetch={false}>
                    {p.name}
                  </Link>
                  {p.category && <p className={styles.category}>{p.category.name}</p>}
                  <div className={styles.priceRow}>
                    <span className={styles.price}>KES {price.toFixed(2)}</span>
                    {oldPrice != null && (
                      <span className={styles.oldPrice}>KES {oldPrice.toFixed(2)}</span>
                    )}
                  </div>
                  <WishlistItemActions
                    productId={p.id}
                    wishlistItemId={row.id}
                    ageRestricted={Boolean(p.age_restricted)}
                    productName={p.name}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
