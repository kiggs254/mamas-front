"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, apiDelete, ApiError } from "@/lib/api";
import { HeartIcon } from "./Icons";

type Props = {
  productId: number;
  initialInWishlist?: boolean;
  className?: string;
  iconSize?: number;
  /** When set, shows text next to the heart (e.g. product page outline button). */
  label?: string;
};

export default function WishlistButton({ productId, initialInWishlist, className, iconSize = 20, label }: Props) {
  const router = useRouter();
  const [inList, setInList] = useState(Boolean(initialInWishlist));
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      if (inList) {
        await apiDelete(`/storefront/wishlist/${productId}`);
        setInList(false);
      } else {
        await apiPost("/storefront/wishlist", { product_id: productId });
        setInList(true);
      }
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 401) {
        router.push("/login");
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      disabled={loading}
      title={inList ? "Remove from wishlist" : "Add to wishlist"}
      aria-label={inList ? "Remove from wishlist" : "Add to wishlist"}
    >
      <HeartIcon size={iconSize} filled={inList} />
      {label ? <span>{label}</span> : null}
    </button>
  );
}
