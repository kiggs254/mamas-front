"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { mutate } from "swr";
import type { Review, StorefrontCategory, StorefrontProduct } from "@/types/api";
import {
  productEffectivePrice,
  productGalleryImages,
  productRatingApprox,
} from "@/lib/products";
import styles from "./ProductDetail.module.css";
import {
  HomeIcon,
  ChevronRightIcon,
  StarIcon,
  CartIcon,
  CompareIcon,
  PlusIcon,
  MinusIcon,
  SearchIcon,
} from "../../components/Icons";
import WishlistButton from "../../components/WishlistButton";
import { apiPost } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/api-config";
import { useAgeRestrictionGate } from "../../components/AgeRestrictionContext";

const COMPARE_KEY = "cleanshelf_compare_ids";

const catPalette = ["#F2FCE4", "#FFFCEB", "#ECFFEC", "#FEEFEA", "#FFF3EB", "#E8F5E9"];

function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return catPalette[h % catPalette.length];
}

type Props = {
  product: StorefrontProduct;
  initialReviews: Review[];
  wishlistInitially: boolean;
  sidebarCategories: StorefrontCategory[];
};

function OfferCountdown({ endsAt }: { endsAt: Date }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = Math.max(0, endsAt.getTime() - now);
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const cells = [
    { v: d, l: "Days" },
    { v: h, l: "Hours" },
    { v: m, l: "Mins" },
    { v: s, l: "Secs" },
  ];
  return (
    <div className={styles.countdownGrid}>
      {cells.map((c) => (
        <div key={c.l} className={styles.countdownCell}>
          <span className={styles.countdownValue}>{c.v}</span>
          <span className={styles.countdownLabel}>{c.l}</span>
        </div>
      ))}
    </div>
  );
}

export default function ProductDetailView({
  product,
  initialReviews,
  wishlistInitially,
  sidebarCategories,
}: Props) {
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "reviews">("desc");
  const [reviewEmail, setReviewEmail] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [offerEnd, setOfferEnd] = useState<Date | null>(null);

  const gallery = useMemo(() => productGalleryImages(product), [product]);
  const displayImages = gallery.length > 0 ? gallery : [];

  useEffect(() => {
    setSelectedImage((i) => {
      if (gallery.length === 0) return 0;
      return Math.min(i, gallery.length - 1);
    });
  }, [gallery.length]);

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
  const onSale = oldPrice != null && oldPrice > price;
  const rating = productRatingApprox(product);

  useEffect(() => {
    if (!onSale) {
      setOfferEnd(null);
      return;
    }
    setOfferEnd(new Date(Date.now() + 48 * 3600000));
  }, [onSale, product.id]);

  const onCompare = useCallback(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(COMPARE_KEY) : null;
      let ids: number[] = raw ? JSON.parse(raw) : [];
      if (!ids.includes(product.id)) ids = [...ids, product.id].slice(0, 4);
      window.localStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [product.id]);

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

  const imageIndex =
    displayImages.length > 0 ? Math.min(selectedImage, displayImages.length - 1) : 0;
  const mainSrc = displayImages[imageIndex]?.url;
  const mainAlt = displayImages[imageIndex]?.alt || product.name;

  return (
    <div className={styles.page}>
      {zoomOpen && mainSrc ? (
        <div
          className={styles.zoomBackdrop}
          role="presentation"
          onClick={() => setZoomOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setZoomOpen(false)}
        >
          <div
            className={styles.zoomInner}
            role="dialog"
            aria-modal="true"
            aria-label="Zoomed product image"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={mainSrc} alt={mainAlt} width={900} height={900} className={styles.zoomImage} />
          </div>
        </div>
      ) : null}

      <div className={styles.breadcrumbs}>
        <Link href="/">
          <HomeIcon size={12} color="var(--color-primary)" /> Home
        </Link>
        <span>
          <ChevronRightIcon size={11} />
        </span>
        <Link href="/shop">Shop</Link>
        <span>
          <ChevronRightIcon size={11} />
        </span>
        {product.category?.slug ? (
          <Link href={`/shop?category_slug=${encodeURIComponent(product.category.slug)}`}>
            {product.category.name}
          </Link>
        ) : (
          <span>{product.category?.name || "Category"}</span>
        )}
        <span>
          <ChevronRightIcon size={11} />
        </span>
        <span className={styles.current}>{product.name}</span>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.galleryColumn}>
          <div className={styles.mainImage}>
            {mainSrc ? (
              <>
                <Image
                  src={mainSrc}
                  alt={mainAlt}
                  fill
                  priority
                  className={styles.mainImageImg}
                  sizes="(max-width: 768px) 100vw, (max-width: 1100px) 45vw, 420px"
                />
                <button
                  type="button"
                  className={styles.zoomBtn}
                  onClick={() => setZoomOpen(true)}
                  aria-label="Zoom image"
                >
                  <SearchIcon size={14} color="#253d4e" />
                </button>
              </>
            ) : (
              <span className={styles.imagePlaceholder}>📦</span>
            )}
          </div>
          {displayImages.length > 0 ? (
            <div className={styles.thumbnails}>
              {displayImages.map((im, i) => (
                <button
                  key={`${im.url}-${i}`}
                  type="button"
                  className={`${styles.thumbnail} ${i === imageIndex ? styles.thumbnailActive : ""}`}
                  onClick={() => setSelectedImage(i)}
                  aria-label={`Image ${i + 1}`}
                >
                  <span className={styles.thumbImageWrap}>
                    <Image
                      src={im.url}
                      alt=""
                      fill
                      sizes="72px"
                      className={styles.thumbImg}
                    />
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.detailColumn}>
          {onSale ? <span className={styles.saleBadge}>Sale!</span> : null}

          <h1 className={styles.title}>{product.name}</h1>

          {onSale && offerEnd ? (
            <div className={styles.countdownBlock}>
              <p className={styles.countdownTitle}>Remains until the end of the offers</p>
              <OfferCountdown endsAt={offerEnd} />
            </div>
          ) : null}

          <div className={styles.metaRow}>
            <div className={styles.reviews}>
              {[1, 2, 3, 4, 5].map((i) => (
                <StarIcon key={i} size={12} filled={i <= rating} />
              ))}
              <span className={styles.reviewCount}>({initialReviews.length})</span>
            </div>
            <span className={styles.stockPill}>{product.status === "published" ? "In stock" : "Unavailable"}</span>
          </div>

          <div className={styles.priceRow}>
            {onSale ? <span className={styles.oldPrice}>KES {oldPrice!.toFixed(2)}</span> : null}
            <span className={styles.currentPrice}>KES {price.toFixed(2)}</span>
          </div>

          {variants.length > 0 && (
            <div className={styles.variantBlock}>
              <label htmlFor="variant">Variant</label>
              <select
                id="variant"
                value={variantId ?? ""}
                onChange={(e) => setVariantId(Number(e.target.value) || null)}
                className={styles.variantSelect}
              >
                {variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.sku || `Option ${v.id}`} — KES {Number(v.sale_price ?? v.price).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div
            className={styles.shortDesc}
            dangerouslySetInnerHTML={{ __html: product.description || "<p>No description yet.</p>" }}
          />

          <div className={styles.purchaseRow}>
            <span className={styles.qtyLabel}>Qty</span>
            <div className={styles.quantityBox}>
              <button type="button" className={styles.qtyBtn} onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <MinusIcon size={12} />
              </button>
              <input
                type="number"
                className={styles.qtyInput}
                value={qty}
                min={1}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              />
              <button type="button" className={styles.qtyBtn} onClick={() => setQty((q) => q + 1)}>
                <PlusIcon size={12} />
              </button>
            </div>
            <MultiAddButton
              productId={product.id}
              variantId={variantId}
              quantity={qty}
              ageRestricted={Boolean(product.age_restricted)}
              productName={product.name}
              className={styles.addToCartInline}
            />
          </div>

          <div className={styles.secondaryActions}>
            <button type="button" className={styles.outlineBtn} onClick={onCompare}>
              <CompareIcon size={15} />
              Compare
            </button>
            <WishlistButton
              productId={product.id}
              initialInWishlist={wishlistInitially}
              iconSize={15}
              label="Add to wishlist"
              className={styles.outlineBtn}
            />
          </div>

          <div className={styles.productMeta}>
            <div className={styles.metaItem}>
              <strong>SKU</strong> <span>{product.sku || "—"}</span>
            </div>
          </div>
        </div>

        <aside className={styles.categoryAside} aria-label="Product categories">
          <h2 className={styles.asideTitle}>Category</h2>
          <ul className={styles.catList}>
            {sidebarCategories.length === 0 ? (
              <li className={styles.catEmpty}>No categories</li>
            ) : (
              sidebarCategories.map((cat) => (
                <li key={cat.id} className={styles.catItem}>
                  <Link
                    href={cat.slug ? `/shop?category_slug=${encodeURIComponent(cat.slug)}` : "/shop"}
                    className={styles.catLink}
                    prefetch={false}
                  >
                    <span className={styles.catIcon} style={{ background: colorFor(cat.name) }}>
                      {cat.image ? (
                        <Image
                          src={resolveMediaUrl(cat.image)}
                          alt=""
                          width={24}
                          height={24}
                          style={{ objectFit: "contain", width: 24, height: 24 }}
                        />
                      ) : (
                        cat.name.trim().charAt(0).toUpperCase()
                      )}
                    </span>
                    <span className={styles.catName}>{cat.name}</span>
                    <span className={styles.catChevron} aria-hidden>
                      ›
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </aside>
      </div>

      <div className={styles.tabsSection}>
        <div className={styles.tabList}>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "desc" ? styles.tabActive : ""}`}
            onClick={() => setTab("desc")}
          >
            Description
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "reviews" ? styles.tabActive : ""}`}
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
              <ul className={styles.reviewList}>
                {initialReviews.map((r) => (
                  <li key={r.id} className={styles.reviewItem}>
                    <strong>★ {r.rating}</strong>{" "}
                    {r.customer?.first_name ? `— ${r.customer.first_name}` : ""}
                    {r.title ? <div className={styles.reviewTitle}>{r.title}</div> : null}
                    <div>{r.comment}</div>
                  </li>
                ))}
              </ul>
              <form onSubmit={submitReview} className={styles.reviewForm}>
                <h4>Write a review</h4>
                <p className={styles.reviewHint}>Guests must include email. Logged-in customers can omit it.</p>
                <input
                  type="email"
                  placeholder="Email (guests)"
                  value={reviewEmail}
                  onChange={(e) => setReviewEmail(e.target.value)}
                  className={styles.formInput}
                />
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className={styles.formSelect}
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
                  className={styles.formInput}
                />
                <textarea
                  placeholder="Your review"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  className={styles.formTextarea}
                />
                <button type="submit" className={styles.submitReviewBtn}>
                  Submit review
                </button>
                {reviewMsg ? <p className={styles.reviewMsg}>{reviewMsg}</p> : null}
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
  ageRestricted,
  productName,
  className,
}: {
  productId: number;
  variantId: number | null;
  quantity: number;
  ageRestricted?: boolean;
  productName?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const { confirmAgeRestrictedAdd } = useAgeRestrictionGate();
  const handle = async () => {
    setLoading(true);
    try {
      if (ageRestricted) {
        const accepted = await confirmAgeRestrictedAdd({ productName });
        if (!accepted) return;
      }
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
    <button
      type="button"
      className={[styles.addToCartBtn, className].filter(Boolean).join(" ")}
      onClick={handle}
      disabled={loading}
    >
      <CartIcon size={15} color="white" /> {loading ? "…" : "Add to cart"}
    </button>
  );
}
