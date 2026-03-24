import Link from "next/link";
import { Package, Clock, Star, TrendingUp } from "lucide-react";
import { getCustomer } from "@/lib/auth";
import { serverApiGet } from "@/lib/server-api";
import styles from "./page.module.css";

export default async function AccountDashboard() {
  const customer = await getCustomer();
  const ordersData = await serverApiGet<{ orders: unknown[]; total: number }>("/storefront/customer/orders?limit=5");
  const wishData = await serverApiGet<{ items: unknown[] }>("/storefront/wishlist");

  const orderCount = ordersData?.total ?? 0;
  const wishCount = wishData?.items?.length ?? 0;
  const first = customer?.first_name || "there";

  const stats = [
    { label: "Total Orders", value: String(orderCount), icon: Package, color: "#3b82f6" },
    { label: "Wishlist", value: String(wishCount), icon: Star, color: "#ec4899" },
    { label: "Account", value: "Active", icon: TrendingUp, color: "#10b981" },
    { label: "Support", value: "24/7", icon: Clock, color: "#f59e0b" },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back, {first}!</h1>
        <p className={styles.subtitle}>Here&apos;s an overview of your account activity.</p>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <div key={idx} className={styles.statCard}>
            <div
              className={styles.iconWrapper}
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              <stat.icon size={24} />
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statValue}>{stat.value}</p>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.recentActivity}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <Link href="/account/orders" className={styles.viewAll}>
            View All Orders
          </Link>
        </div>

        {orderCount === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <Package size={48} />
            </div>
            <h3>No recent orders</h3>
            <p>You haven&apos;t placed any orders recently. Start shopping to see them here.</p>
            <Link href="/shop" className={styles.shopButton}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <p style={{ color: "#666" }}>
            You have <strong>{orderCount}</strong> order(s).{" "}
            <Link href="/account/orders">View history</Link>
          </p>
        )}
      </div>
    </div>
  );
}
