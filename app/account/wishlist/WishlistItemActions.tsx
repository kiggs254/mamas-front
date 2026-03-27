"use client";

import { useState } from "react";
import { Trash2, ShoppingCart } from "lucide-react";
import { apiDelete, apiPost } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import styles from "./wishlist.module.css";

type Props = { productId: number; wishlistItemId: number };

export default function WishlistItemActions({ productId, wishlistItemId }: Props) {
  const { mutate } = useCart();
  const [addingCart, setAddingCart] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const addToCart = async () => {
    setAddingCart(true);
    try {
      await apiPost("/storefront/cart", { product_id: productId, quantity: 1 });
      await mutate();
      window.dispatchEvent(new Event("openCart"));
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    } finally {
      setAddingCart(false);
    }
  };

  const remove = async () => {
    setRemoving(true);
    try {
      await apiDelete(`/storefront/wishlist/${wishlistItemId}`);
      window.location.reload();
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.addCartBtn}
        onClick={addToCart}
        disabled={addingCart}
      >
        <ShoppingCart size={15} />
        {addingCart ? "Adding…" : addedFeedback ? "Added!" : "Add to cart"}
      </button>
      <button
        type="button"
        className={styles.removeBtn}
        onClick={remove}
        disabled={removing}
        aria-label="Remove from wishlist"
      >
        <Trash2 size={15} />
        Remove
      </button>
    </div>
  );
}
