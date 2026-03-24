"use client";

import styles from './Header.module.css';
import { CartIcon } from './Icons';

export default function HeaderCart() {
  const openCart = () => {
    window.dispatchEvent(new Event("openCart"));
  };

  return (
    <div className={styles.headerAction} onClick={openCart}>
      <span className={styles.icon}><CartIcon size={22} /></span>
      <span className={styles.badge}>3</span>
      <div className={styles.actionText}>
        <span className={styles.actionLabel}>Cart</span>
        <span className={styles.actionValue}>KES 1,260</span>
      </div>
    </div>
  );
}
