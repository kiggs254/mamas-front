"use client";

import { useCallback, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { parseNumericBranchId, readSelectedBranch } from "@/lib/branch-selection";
import { useCart } from "@/hooks/useCart";

export function useBranchCartConflict() {
  const { data: cartData, mutate } = useCart();
  const [branchesEnabledShop, setBranchesEnabledShop] = useState(false);
  const [conflictIds, setConflictIds] = useState<number[]>([]);
  const [checking, setChecking] = useState(false);

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
      return;
    }
    const branch = readSelectedBranch();
    const bid = parseNumericBranchId(branch?.id);
    const lines = cartData?.items;
    if (bid == null || !lines || lines.length === 0) {
      setConflictIds([]);
      return;
    }
    setChecking(true);
    try {
      const d = await apiPost<{ unavailable_line_ids: number[] }>("/storefront/cart/validate-branch-stock", {
        branch_id: bid,
      });
      setConflictIds(Array.isArray(d.unavailable_line_ids) ? d.unavailable_line_ids : []);
    } catch {
      setConflictIds([]);
    } finally {
      setChecking(false);
    }
  }, [branchesEnabledShop, cartData?.items]);

  useEffect(() => {
    runCheck();
  }, [runCheck]);

  useEffect(() => {
    const onLoc = () => {
      runCheck();
    };
    window.addEventListener("locationChange", onLoc);
    return () => window.removeEventListener("locationChange", onLoc);
  }, [runCheck]);

  const proceedRemove = useCallback(async () => {
    if (conflictIds.length === 0) return;
    await Promise.all(conflictIds.map((id) => apiDelete(`/storefront/cart/${id}`)));
    setConflictIds([]);
    await mutate();
  }, [conflictIds, mutate]);

  const dismiss = useCallback(() => setConflictIds([]), []);

  return { conflictIds, checking, proceedRemove, dismiss, branchesEnabledShop };
}
