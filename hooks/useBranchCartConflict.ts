"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { parseNumericBranchId, readSelectedBranch } from "@/lib/branch-selection";
import { useCart } from "@/hooks/useCart";

export type UnavailableCartItem = {
  cart_line_id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  product_name: string;
  variant_label: string | null;
};

export function useBranchCartConflict() {
  const { data: cartData, mutate } = useCart();
  const [branchesEnabledShop, setBranchesEnabledShop] = useState(false);
  const [conflictIds, setConflictIds] = useState<number[]>([]);
  const [unavailableItems, setUnavailableItems] = useState<UnavailableCartItem[]>([]);
  const [checking, setChecking] = useState(false);
  const [choosingBranch, setChoosingBranch] = useState(false);

  useEffect(() => {
    apiGet<{ settings: Record<string, string> }>("/storefront/settings")
      .then((d) => {
        setBranchesEnabledShop(d?.settings?.branches_enabled === "true");
      })
      .catch(() => setBranchesEnabledShop(false));
  }, []);

  const runCheck = useCallback(async () => {
    if (!branchesEnabledShop) {
      setConflictIds([]);
      setUnavailableItems([]);
      return;
    }
    const branch = readSelectedBranch();
    const bid = parseNumericBranchId(branch?.id);
    const lines = cartData?.items;
    if (bid == null || !lines || lines.length === 0) {
      setConflictIds([]);
      setUnavailableItems([]);
      return;
    }
    setChecking(true);
    try {
      const d = await apiPost<{
        unavailable_line_ids: number[];
        unavailable_items?: UnavailableCartItem[];
      }>("/storefront/cart/validate-branch-stock", {
        branch_id: bid,
      });
      const ids = Array.isArray(d.unavailable_line_ids) ? d.unavailable_line_ids : [];
      setConflictIds(ids);
      if (Array.isArray(d.unavailable_items) && d.unavailable_items.length > 0) {
        setUnavailableItems(d.unavailable_items);
      } else if (ids.length > 0) {
        const mapped: UnavailableCartItem[] = ids
          .map((lineId) => {
            const line = lines.find((l) => l.id === lineId);
            if (!line) return null;
            const p = line.product as { name?: string } | undefined;
            const v = line.variant as { sku?: string } | null | undefined;
            return {
              cart_line_id: line.id,
              product_id: line.product_id,
              variant_id: line.variant_id ?? null,
              quantity: line.quantity,
              product_name: p?.name || "Product",
              variant_label: v?.sku || null,
            };
          })
          .filter((x): x is UnavailableCartItem => x != null);
        setUnavailableItems(mapped);
      } else {
        setUnavailableItems([]);
      }
    } catch {
      setConflictIds([]);
      setUnavailableItems([]);
    } finally {
      setChecking(false);
    }
  }, [branchesEnabledShop, cartData?.items]);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  useEffect(() => {
    const onLoc = () => {
      setChoosingBranch(false);
      runCheck();
    };
    const onPickerClose = () => {
      setChoosingBranch(false);
      runCheck();
    };
    window.addEventListener("locationChange", onLoc);
    window.addEventListener("locationPickerClose", onPickerClose);
    return () => {
      window.removeEventListener("locationChange", onLoc);
      window.removeEventListener("locationPickerClose", onPickerClose);
    };
  }, [runCheck]);

  const proceedRemove = useCallback(async () => {
    if (conflictIds.length === 0) return;
    await Promise.all(conflictIds.map((id) => apiDelete(`/storefront/cart/${id}`)));
    setConflictIds([]);
    setUnavailableItems([]);
    await mutate();
  }, [conflictIds, mutate]);

  const openSwitchBranch = useCallback(() => {
    setChoosingBranch(true);
    window.dispatchEvent(new Event("openLocationPicker"));
  }, []);

  return {
    conflictIds,
    unavailableItems,
    checking,
    choosingBranch,
    proceedRemove,
    openSwitchBranch,
    branchesEnabledShop,
  };
}
