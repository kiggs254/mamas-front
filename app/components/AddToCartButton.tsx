"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { CartIcon } from "./Icons";
import { useAgeRestrictionGate } from "./AgeRestrictionContext";

type Props = {
  productId: number;
  variantId?: number | null;
  className?: string;
  label?: string;
  cartIconSize?: number;
  ageRestricted?: boolean;
  productName?: string;
};

export default function AddToCartButton({
  productId,
  variantId,
  className,
  label = "Add",
  cartIconSize = 14,
  ageRestricted = false,
  productName,
}: Props) {
  const { mutate } = useCart();
  const { confirmAgeRestrictedAdd } = useAgeRestrictionGate();
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      if (ageRestricted) {
        const accepted = await confirmAgeRestrictedAdd({ productName });
        if (!accepted) return;
      }
      await apiPost("/storefront/cart", {
        product_id: productId,
        quantity: 1,
        ...(variantId ? { variant_id: variantId } : {}),
      });
      await mutate();
      window.dispatchEvent(new Event("openCart"));
    } catch {
      /* toast could go here */
    } finally {
      setLoading(false);
    }
  };

  return (
    <button type="button" className={className} onClick={handle} disabled={loading}>
      <CartIcon size={cartIconSize} /> {loading ? "…" : label}
    </button>
  );
}
