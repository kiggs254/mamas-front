import Link from "next/link";
import Image from "next/image";
import { serverApiGet } from "@/lib/server-api";
import { resolveMediaUrl } from "@/lib/api-config";
import type { StorefrontProduct } from "@/types/api";
import { productEffectivePrice, productHref } from "@/lib/products";
import WishlistActions from "./WishlistActions";
import styles from "./wishlist.module.css";

export default async function WishlistPage() {
  const data = await serverApiGet<{ items: { id: number; product_id: number; product?: StorefrontProduct }[] }>(
    "/storefront/wishlist"
  );
  const items = data?.items || [];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Wishlist</h1>
      {items.length === 0 ? (
        <p>
          No saved items. <Link href="/shop">Browse products</Link>
        </p>
      ) : (
        <ul className={styles.list}>
          {items.map((row) => {
            const p = row.product;
            if (!p) return null;
            const { price } = productEffectivePrice(p);
            const img = p.images?.[0]?.url ? resolveMediaUrl(p.images[0].url) : "";
            const href = productHref(p);
            return (
              <li key={row.id} className={styles.card}>
                <Link href={href} className={styles.thumb} prefetch={false}>
                  {img ? <Image src={img} alt="" width={80} height={80} style={{ objectFit: "contain" }} /> : "📦"}
                </Link>
                <div className={styles.body}>
                  <Link href={href} className={styles.name} prefetch={false}>
                    {p.name}
                  </Link>
                  <div className={styles.price}>KES {price.toFixed(2)}</div>
                  <WishlistActions productId={p.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
