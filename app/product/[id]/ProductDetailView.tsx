"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { mutate } from "swr";
import type { Review, StorefrontProduct } from "@/types/api";
import { productEffectivePrice, productPrimaryImage, productRatingApprox } from "@/lib/products";
import styles from "./ProductDetail.module.css";
import {
  HomeIcon,
  ChevronRightIcon,
  StarIcon,
  CartIcon,
  CompareIcon,
  PlusIcon,
  MinusIcon,
} from "../../components/Icons";
import WishlistButton from "../../components/WishlistButton";
import { apiPost } from "@/lib/api";

type Props = {
  product: StorefrontProduct;
  initialReviews: Review[];
  wishlistInitially: boolean;
};

export default function ProductDetailView({ product, initialReviews, wishlistInitially }: Props) {
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "reviews">("desc");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");

  const variants = product.variants || [];
  const [variantId, setVariantId] = useState<number | null>(variants[0]?.id ?? null);

  const variantPrices = useMemo(() => {
    const v = variants.find((x) => x.id === variantId);
    if (!v) return productEffectivePrice(product);
    const vp = Number(v.price) || 0;
    const vs = v.sale_price != null ? Number(v.sale_price) : null;
    if (vs != null && !Number.isNaN(vs) && vs > 0 && vs < vp) return { price: vs, oldPrice: vp };
    return { price: vp, oldPrice: undefined as number | undefined };
  }, [variants, variantId, product]);

  const { price, oldPrice } = variantPrices;
  const img = productPrimaryImage(product);
  const rating = productRatingApprox(product);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewMsg("");
    try {
      await apiPost("/storefront/reviews", {
        product_id: product.id,
        rating: reviewRating,
        title: reviewTitle || undefined,
        comment: reviewComment || undefined,
        email: reviewEmail || undefined,
      });
      setReviewMsg("Thanks! Your review was submitted for moderation.");
      setReviewTitle("");
      setReviewComment("");
    } catch (err: unknown) {
      setReviewMsg(err instanceof Error ? err.message : "Could not submit review");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbs}>
        <Link href="/">
          <HomeIcon size={14} color="var(--color-primary)" /> Home
        </Link>
        <span>
          <ChevronRightIcon size={12} />
        </span>
        <Link href="/shop">Shop</Link>
        <span>
          <ChevronRightIcon size={12} />
        </span>
        {product.category?.slug ? (
          <Link href={`/shop?category_slug=${encodeURIComponent(product.category.slug)}`}>
            {product.category.name}
          </Link>
        ) : (
          <span>{product.category?.name || "Category"}</span>
        )}
        <span>
          <ChevronRightIcon size={12} />
        </span>
        <span className={styles.current}>{product.name}</span>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.galleryWrap}>
          <div className={styles.mainImage}>
            {img ? (
              <Image src={img} alt={product.name} width={400} height={400} style={{ objectFit: "contain" }} />
            ) : (
              <span style={{ fontSize: 80 }}>📦</span>
            )}
          </div>
        </div>

        <div className={styles.detailsWrap}>
          <div className={styles.stockStatus}>{product.status === "published" ? "In Stock" : "Unavailable"}</div>
          <h1 className={styles.title}>{product.name}</h1>

          <div className={styles.metaRow}>
            <div className={styles.reviews}>
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} size={14} filled={i <= rating} />
              ))}
              <span style={{ marginLeft: "5px" }}>({initialReviews.length} reviews)</span>
            </div>
          </div>

          <div className={styles.priceBox}>
            <span className={styles.currentPrice}>KES {price.toFixed(2)}</span>
            {oldPrice != null && (
              <div className={styles.oldPriceWrap}>
                <span className={styles.oldPrice}>KES {oldPrice.toFixed(2)}</span>
              </div>
            )}
          </div>

          {variants.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="variant" style={{ display: "block", marginBottom: 6 }}>
                Variant
              </label>
              <select
                id="variant"
                value={variantId ?? ""}
                onChange={(e) => setVariantId(Number(e.target.value) || null)}
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.sku || `Option ${v.id}`} — KES {Number(v.sale_price ?? v.price).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.shortDesc} dangerouslySetInnerHTML={{ __html: product.description || "" }} />

          <div className={styles.actionRow}>
            <div className={styles.quantityBox}>
              <button type="button" className={styles.qtyBtn} onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <MinusIcon size={14} />
              </button>
              <input
                type="number"
                className={styles.qtyInput}
                value={qty}
                min={1}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              />
              <button type="button" className={styles.qtyBtn} onClick={() => setQty((q) => q + 1)}>
                <PlusIcon size={14} />
              </button>
            </div>
            <MultiAddButton productId={product.id} variantId={variantId} quantity={qty} />
            <WishlistButton productId={product.id} initialInWishlist={wishlistInitially} className={styles.secondaryActionBtn} />
            <button type="button" className={styles.secondaryActionBtn} title="Compare">
              <CompareIcon size={20} />
            </button>
          </div>

          <div className={styles.productMeta}>
            <div className={styles.metaItem}>
              <strong>SKU:</strong> <span>{product.sku || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tabsSection}>
        <div className={styles.tabList}>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "desc" ? styles.active : ""}`}
            onClick={() => setTab("desc")}
          >
            Description
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "reviews" ? styles.active : ""}`}
            onClick={() => setTab("reviews")}
          >
            Reviews ({initialReviews.length})
          </button>
        </div>
        <div className={styles.tabContent}>
          {tab === "desc" ? (
            <div dangerouslySetInnerHTML={{ __html: product.description || "<p>No description.</p>" }} />
          ) : (
            <div>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {initialReviews.map((r) => (
                  <li key={r.id} style={{ marginBottom: 16, borderBottom: "1px solid #eee", paddingBottom: 12 }}>
                    <strong>★ {r.rating}</strong>{" "}
                    {r.customer?.first_name ? `— ${r.customer.first_name}` : ""}
                    {r.title ? <div style={{ fontWeight: 600 }}>{r.title}</div> : null}
                    <div>{r.comment}</div>
                  </li>
                ))}
              </ul>
              <form onSubmit={submitReview} style={{ marginTop: 24 }}>
                <h4>Write a review</h4>
                <p style={{ fontSize: 14, color: "#666" }}>
                  Guests must include email. Logged-in customers can omit it.
                </p>
                <input
                  type="email"
                  placeholder="Email (guests)"
                  value={reviewEmail}
                  onChange={(e) => setReviewEmail(e.target.value)}
                  style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
                />
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  style={{ display: "block", marginBottom: 8 }}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} stars
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Title (optional)"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
                />
                <textarea
                  placeholder="Your review"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  style={{ display: "block", width: "100%", marginBottom: 8, padding: 8 }}
                />
                <button type="submit" className={styles.addToCartBtn}>
                  Submit review
                </button>
                {reviewMsg && <p style={{ marginTop: 8 }}>{reviewMsg}</p>}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MultiAddButton({
  productId,
  variantId,
  quantity,
}: {
  productId: number;
  variantId: number | null;
  quantity: number;
}) {
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    setLoading(true);
    try {
      for (let i = 0; i < quantity; i++) {
        await apiPost("/storefront/cart", {
          product_id: productId,
          quantity: 1,
          ...(variantId ? { variant_id: variantId } : {}),
        });
      }
      await mutate("/storefront/cart");
      window.dispatchEvent(new Event("openCart"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <button type="button" className={styles.addToCartBtn} onClick={handle} disabled={loading}>
      <CartIcon size={18} color="white" /> {loading ? "…" : "Add to cart"}
    </button>
  );
}
