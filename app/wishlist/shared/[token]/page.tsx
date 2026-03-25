import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { serverApiGet } from "@/lib/server-api";
import { resolveMediaUrl } from "@/lib/api-config";
import type { StorefrontProduct } from "@/types/api";
import { productHref } from "@/lib/products";
import shell from "../../../styles/shell.module.css";
import styles from "./shared.module.css";

export default async function SharedWishlistPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const data = await serverApiGet<{ items: { product?: StorefrontProduct }[] }>(
    `/storefront/wishlist/shared/${encodeURIComponent(token)}`
  );
  if (!data?.items) notFound();

  return (
    <div className={styles.page}>
      <nav className={shell.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={shell.sep}>/</span>
        <span>Shared wishlist</span>
      </nav>

      <header className={styles.header}>
        <p className={styles.eyebrow}>Someone shared</p>
        <h1 className={styles.title}>Shared wishlist</h1>
        <div className={styles.titleUnderline} />
      </header>

      <ul className={styles.list}>
        {data.items.map((row, i) => {
          const p = row.product;
          if (!p) return null;
          const img = p.images?.[0]?.url ? resolveMediaUrl(p.images[0].url) : "";
          const href = productHref(p);
          return (
            <li key={`${p.id}-${i}`} className={styles.row}>
              <Link href={href} prefetch={false}>
                {img ? <Image src={img} alt="" width={64} height={64} style={{ objectFit: "contain" }} /> : "📦"}
              </Link>
              <Link href={href} prefetch={false} className={styles.name}>
                {p.name}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className={styles.footer}>
        <Link href="/shop" className={styles.shopLink} prefetch={false}>
          Browse shop
        </Link>
      </div>
    </div>
  );
}
