"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { CompareIcon, EyeIcon } from "./Icons";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import { StarIcon } from "./Icons";
import styles from "./StoreProductCard.module.css";

const COMPARE_KEY = "cleanshelf_compare_ids";

type Props = {
  id: number;
  name: string;
  href: string;
  imageUrl: string;
  categoryLabel: string;
  price: number;
  oldPrice: number | null;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  variantId?: number | null;
  ageRestricted?: boolean;
  initialInWishlist?: boolean;
  showWishlist?: boolean;
  currencyLabel?: string;
};

function StarRating({ rating }: { rating: number }) {
  const r = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} size={12} filled={i <= r} />
      ))}
    </>
  );
}

export default function StoreProductCard({
  id,
  name,
  href,
  imageUrl,
  categoryLabel,
  price,
  oldPrice,
  discountPercent,
  rating,
  reviewCount,
  variantId,
  ageRestricted = false,
  initialInWishlist,
  showWishlist = true,
  currencyLabel = "KES",
}: Props) {
  const onCompare = useCallback(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(COMPARE_KEY) : null;
      let ids: number[] = raw ? JSON.parse(raw) : [];
      if (!ids.includes(id)) ids = [...ids, id].slice(0, 4);
      window.localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [id]);

  return (
    <div className={styles.card}>
      {discountPercent > 0 ? <span className={styles.discountBadge}>{discountPercent}%</span> : null}

      <div className={styles.imageArea}>
        <Link href={href} className={styles.imageLink} prefetch={false} aria-label={name}>
          {imageUrl ? (
            <Image src={imageUrl} alt="" width={200} height={160} sizes="(max-width: 768px) 45vw, 168px" style={{ objectFit: "contain" }} />
          ) : (
            <span className={styles.placeholder} aria-hidden>
              📦
            </span>
          )}
        </Link>
        <div className={styles.overlay}>
          <div className={styles.hoverBar}>
            <Link href={href} className={styles.hoverAction} prefetch={false} aria-label={`Quick view ${name}`}>
              <EyeIcon size={17} />
            </Link>
            <span className={styles.hoverDivider} aria-hidden />
            <button type="button" className={styles.hoverAction} onClick={onCompare} aria-label="Add to compare" title="Add to compare">
              <CompareIcon size={17} />
            </button>
            {showWishlist ? (
              <>
                <span className={styles.hoverDivider} aria-hidden />
                <WishlistButton
                  productId={id}
                  initialInWishlist={initialInWishlist}
                  iconSize={17}
                  className={styles.wishlistInBar}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.category}>{categoryLabel}</div>
      <Link href={href} className={styles.name} prefetch={false}>
        {name}
      </Link>
      <div className={styles.ratingRow}>
        <StarRating rating={rating} />
        <span className={styles.reviewCount}>{reviewCount}</span>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.priceBlock}>
          <span className={styles.price}>
            {currencyLabel} {price.toFixed(2)}
          </span>
          {oldPrice != null ? (
            <span className={styles.oldPrice}>
              {currencyLabel} {oldPrice.toFixed(2)}
            </span>
          ) : null}
        </div>
        <AddToCartButton
          productId={id}
          variantId={variantId}
          ageRestricted={ageRestricted}
          productName={name}
          className={styles.addBtn}
          cartIconSize={14}
        />
      </div>
    </div>
  );
}
