import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import type { SubscriptionRow } from "@/types/api";
import styles from "./subscriptions.module.css";

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

function statusCls(s?: string) {
  return (s || "").toLowerCase();
}

export default async function AccountSubscriptionsPage() {
  const data = await serverApiGet<{ subscriptions: SubscriptionRow[] }>("/storefront/customer/subscriptions");
  const subs = data?.subscriptions || [];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Subscriptions</h1>
        <p className={styles.subtitle}>Your recurring delivery plans.</p>
      </div>

      {subs.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 4v6h6"/><path d="M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
          </div>
          <h3>No subscriptions yet</h3>
          <p>Set up a recurring delivery plan to save time and money.</p>
          <Link href="/subscriptions" className={styles.shopBtn}>View subscription packages</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {subs.map((s) => {
            const packageName = (s as { package_name?: string }).package_name || s.package?.name || "Package";
            const packagePrice = s.package?.price;
            return (
              <div key={s.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{packageName}</h3>
                    {packagePrice != null && (
                      <p className={styles.cardPrice}>KES {Number(packagePrice).toFixed(2)} / month</p>
                    )}
                  </div>
                  <span className={`${styles.badge} ${styles[statusCls(s.status)]}`}>
                    {s.status || "unknown"}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.dateRow}>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>Next delivery</span>
                      <span className={styles.dateValue}>{formatDate(s.next_delivery_date)}</span>
                    </div>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>Next payment</span>
                      <span className={styles.dateValue}>{formatDate(s.next_payment_date)}</span>
                    </div>
                    <div className={styles.dateItem}>
                      <span className={styles.dateLabel}>Ref</span>
                      <span className={styles.dateValue}>#{s.id}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <Link href="/subscriptions" className={styles.manageBtn}>
                    Manage subscription
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
