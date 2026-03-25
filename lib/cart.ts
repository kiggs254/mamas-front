import { productEffectivePrice } from "@/lib/products";
import type { CartLine, ProductVariant, StorefrontProduct } from "@/types/api";

export function cartLineUnitPrice(line: CartLine): number {
  const v = line.variant as ProductVariant | null | undefined;
  if (v && v.price != null) {
    const vp = Number(v.price);
    const vs = v.sale_price != null ? Number(v.sale_price) : null;
    if (vs != null && !Number.isNaN(vs) && vs > 0 && vs < vp) return vs;
    return vp;
  }
  const p = line.product as StorefrontProduct | undefined;
  if (p) return productEffectivePrice(p).price;
  return 0;
}

export function cartTotalQuantity(items: CartLine[]): number {
  return items.reduce((acc, line) => acc + (Number(line.quantity) || 0), 0);
}

export function cartSubtotal(items: CartLine[]): number {
  return items.reduce((acc, line) => acc + cartLineUnitPrice(line) * (Number(line.quantity) || 0), 0);
}
