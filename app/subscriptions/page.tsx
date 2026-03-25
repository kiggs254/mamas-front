import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import type { SubscriptionPackage } from "@/types/api";
import shell from "../styles/shell.module.css";
import styles from "./subscriptions.module.css";

export default async function SubscriptionsPage() {
  const data = await serverApiGet<{ packages: SubscriptionPackage[] }>("/storefront/subscription-packages");
  const packages = data?.packages || [];

  return (
    <div className={styles.page}>
      <nav className={shell.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={shell.sep}>/</span>
        <span>Subscriptions</span>
      </nav>

      <header className={styles.header}>
        <p className={styles.eyebrow}>Nairobi delivery</p>
        <h1 className={styles.title}>Subscription packages</h1>
        <div className={styles.titleUnderline} />
        <p className={styles.lead}>
          Weekly grocery bundles delivered in Nairobi. Pick a package and complete signup at checkout.
        </p>
      </header>

      {packages.length === 0 ? (
        <p className={styles.empty}>No active subscription packages right now.</p>
      ) : (
        <div className={styles.grid}>
          {packages.map((pkg) => (
            <div key={pkg.id} className={styles.card}>
              <h2>{pkg.name}</h2>
              <p className={styles.price}>
                {pkg.weekly_price != null
                  ? `From KES ${Number(pkg.weekly_price).toFixed(2)} / week`
                  : pkg.price != null
                    ? `KES ${Number(pkg.price).toFixed(2)}`
                    : "See checkout for pricing"}
              </p>
              <Link href={`/subscriptions/signup?package_id=${pkg.id}`} className={styles.cta} prefetch={false}>
                Subscribe
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
