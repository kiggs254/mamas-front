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
  const imgs = p.images;
  if (Array.isArray(imgs) && imgs[0]?.url) {
    return resolveMediaUrl(imgs[0].url);
  }
  return "";
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
  return 4;
}
