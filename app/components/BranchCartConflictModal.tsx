"use client";

import { useEffect, useRef } from "react";
import { readSelectedBranch } from "@/lib/branch-selection";
import { useBranchCartConflictState } from "./BranchCartConflictContext";
import styles from "./BranchCartConflictModal.module.css";

export default function BranchCartConflictModal() {
  const ctx = useBranchCartConflictState();
  const panelRef = useRef<HTMLDivElement>(null);

  const open = Boolean(ctx?.branchesEnabledShop && ctx.conflictIds.length > 0 && !ctx.choosingBranch);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!ctx?.branchesEnabledShop) return null;
  if (!open) return null;

  const items = ctx.unavailableItems;
  const sel = readSelectedBranch();
  const branchName = sel?.name?.trim() || "this branch";

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="branch-cart-conflict-title"
    >
      <div className={styles.modal} ref={panelRef}>
        <h2 id="branch-cart-conflict-title" className={styles.title}>
          Not available at {branchName}
        </h2>
        <p className={styles.lead}>
          These items are not in stock at the branch you selected. Continue to remove them from your cart, or switch to
          another branch.
        </p>
        <ul className={styles.list}>
          {items.map((row) => (
            <li key={row.cart_line_id} className={styles.listItem}>
              <span className={styles.productName}>{row.product_name}</span>
              {row.variant_label ? (
                <span className={styles.variant}>{row.variant_label}</span>
              ) : null}
              <span className={styles.qty}>Qty {row.quantity}</span>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={() => void ctx.proceedRemove()}>
            Continue and remove
          </button>
          <button type="button" className={styles.secondary} onClick={ctx.openSwitchBranch}>
            Switch branch
          </button>
        </div>
      </div>
    </div>
  );
}
