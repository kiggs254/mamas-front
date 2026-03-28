"use client";

import styles from "./BranchCartWarning.module.css";

type Props = {
  conflictIds: number[];
  checking: boolean;
  onProceed: () => void | Promise<void>;
  onDismiss: () => void;
  /** e.g. column for full-width mobile row */
  className?: string;
};

export default function BranchCartWarning({ conflictIds, checking, onProceed, onDismiss, className }: Props) {
  if (checking) {
    return (
      <div className={`${styles.wrap} ${className ?? ""}`} role="status">
        <span className={styles.checking}>Checking cart for this branch…</span>
      </div>
    );
  }

  if (conflictIds.length === 0) return null;

  return (
    <div className={`${styles.wrap} ${className ?? ""}`} role="alert">
      <p className={styles.text}>
        Some items in your cart are not in stock at this branch. If you continue, those items will be removed from
        your cart.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.proceed} onClick={() => void onProceed()}>
          Continue and remove
        </button>
        <button type="button" className={styles.dismiss} onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
