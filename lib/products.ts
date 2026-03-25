import { resolveMediaUrl } from "./api-config";
import type { StorefrontProduct } from "@/types/api";

export function productEffectivePrice(p: StorefrontProduct): {
  price: number;
  oldPrice?: number;
} {
  const base = Number(p.price) || 0;
  const sale =
    p.sale_price != null && p.sale_price !== undefined ? Number(p.sale_price) : null;
  if (sale != null && !Number.isNaN(sale) && sale > 0 && sale < base) {
    return { price: sale, oldPrice: base };
  }
  return { price: base };
}

export function productPrimaryImage(p: StorefrontProduct): string {
  const gallery = productGalleryImages(p);
  return gallery[0]?.url ?? "";
}

function rawImageUrl(im: unknown): string | null {
  if (!im || typeof im !== "object") return null;
  const o = im as Record<string, unknown>;
  const u = o.url ?? o.image_url ?? o.src;
  if (typeof u !== "string") return null;
  const t = u.trim();
  return t.length > 0 ? t : null;
}

/** All product images for gallery, ordered by `order` then array order. */
export function productGalleryImages(p: StorefrontProduct): { url: string; alt: string }[] {
  const imgs = p.images;
  if (!Array.isArray(imgs) || imgs.length === 0) return [];
  const sorted = [...imgs].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  const out: { url: string; alt: string }[] = [];
  for (const im of sorted) {
    const raw = rawImageUrl(im);
    if (!raw) continue;
    out.push({
      url: resolveMediaUrl(raw),
      alt: typeof (im as { alt?: unknown }).alt === "string" ? (im as { alt: string }).alt : "",
    });
  }
  return out;
}

export function productHref(p: StorefrontProduct): string {
  const slug = p.slug || String(p.id);
  return `/product/${encodeURIComponent(slug)}`;
}

export function productRatingApprox(p: StorefrontProduct): number {
  const revs = p.reviews;
  if (Array.isArray(revs) && revs.length > 0) {
    const sum = revs.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return Math.round(sum / revs.length);
  }
  return 0;
}

export function productReviewCount(p: StorefrontProduct): number {
  return Array.isArray(p.reviews) ? p.reviews.length : 0;
}

/** Whole percent off when on sale (for badge), min 1. */
export function productSalePercentOff(price: number, oldPrice: number): number {
  if (!(oldPrice > 0) || !(price > 0) || price >= oldPrice) return 0;
  return Math.max(1, Math.min(99, Math.round((1 - price / oldPrice) * 100)));
}
