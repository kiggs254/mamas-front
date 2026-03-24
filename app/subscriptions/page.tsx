import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import type { SubscriptionPackage } from "@/types/api";
import styles from "./subscriptions.module.css";

export default async function SubscriptionsPage() {
  const data = await serverApiGet<{ packages: SubscriptionPackage[] }>("/storefront/subscription-packages");
  const packages = data?.packages || [];

  return (
    <div className={styles.page}>
      <h1>Subscription packages</h1>
      <p>Weekly grocery bundles delivered in Nairobi (see backend rules).</p>
      <div className={styles.grid}>
        {packages.map((pkg) => (
          <div key={pkg.id} className={styles.card}>
            <h2>{pkg.name}</h2>
            <p className={styles.price}>
              {pkg.weekly_price != null
                ? `From KES ${Number(pkg.weekly_price).toFixed(2)} / week`
                : pkg.price != null
                  ? `KES ${Number(pkg.price).toFixed(2)}`
                  : "See checkout"}
            </p>
            <Link href={`/subscriptions/signup?package_id=${pkg.id}`} className={styles.cta}>
              Subscribe
            </Link>
          </div>
        ))}
      </div>
      {packages.length === 0 && <p>No active packages.</p>}
    </div>
  );
}
