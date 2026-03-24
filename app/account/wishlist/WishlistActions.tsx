"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import AddToCartButton from "../../components/AddToCartButton";

export default function WishlistActions({ productId }: { productId: number }) {
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const share = async () => {
    setBusy(true);
    try {
      const res = await apiPost<{ token: string }>("/storefront/wishlist/share", {});
      setToken(res.token);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
      <AddToCartButton productId={productId} label="Add to cart" />
      <button type="button" onClick={share} disabled={busy}>
        Share list
      </button>
      {token && (
        <span style={{ fontSize: 12 }}>
          Link token: <code>{token}</code> — open <code>/wishlist/shared/{token}</code>
        </span>
      )}
    </div>
  );
}
