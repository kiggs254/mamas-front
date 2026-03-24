import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import type { SubscriptionRow } from "@/types/api";
import styles from "../page.module.css";

export default async function AccountSubscriptionsPage() {
  const data = await serverApiGet<{ subscriptions: SubscriptionRow[] }>("/storefront/customer/subscriptions");
  const subs = data?.subscriptions || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Subscriptions</h1>
        <p className={styles.subtitle}>Your recurring deliveries.</p>
      </div>
      {subs.length === 0 ? (
        <p>
          No subscriptions. <Link href="/subscriptions">View packages</Link>
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {subs.map((s) => (
            <li key={s.id} style={{ padding: 16, border: "1px solid #eee", borderRadius: 8, marginBottom: 12 }}>
              <strong>{(s as { package_name?: string }).package_name || s.package?.name || "Package"}</strong> —{" "}
              {s.status}
              <div style={{ fontSize: 14, color: "#666" }}>
                Next delivery: {s.next_delivery_date || "—"} · Next payment: {s.next_payment_date || "—"}
              </div>
              <span style={{ fontSize: 12, color: "#999" }}>Ref #{s.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
