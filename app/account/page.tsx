import Link from "next/link";
import { getCustomer } from "@/lib/auth";
import { serverApiGet } from "@/lib/server-api";
import { formatShopDate } from "@/lib/shop-datetime";
import type { OrderSummary } from "@/types/api";
import styles from "./page.module.css";

function statusClass(status: string) {
  const s = (status || "pending").toLowerCase();
  return s;
}

export default async function AccountDashboard() {
  const customer = await getCustomer();
  const [ordersData, wishData, settingsData, loyaltyData] = await Promise.all([
    serverApiGet<{ orders: OrderSummary[]; total: number }>("/storefront/customer/orders?limit=5"),
    serverApiGet<{ items: unknown[] }>("/storefront/wishlist"),
    serverApiGet<{ settings: Record<string, string> }>("/storefront/settings"),
    serverApiGet<{ enabled: boolean; balance: number; points_per_currency_discount?: number }>("/storefront/customer/loyalty"),
  ]);
  const shopTimeZone = settingsData?.settings?.shop_timezone?.trim() || undefined;
  const loyaltyEnabled = loyaltyData?.enabled ?? false;
  const loyaltyBalance = loyaltyData?.balance ?? 0;

  const orderCount = ordersData?.total ?? 0;
  const recentOrders = ordersData?.orders || [];
  const wishCount = wishData?.items?.length ?? 0;
  const first = customer?.first_name || "there";
  const initials = [customer?.first_name, customer?.last_name]
    .filter(Boolean)
    .map((n) => n!.charAt(0).toUpperCase())
    .join("") || "?";

  return (
    <div className={styles.container}>
      <div className={styles.heroRow}>
        <div className={styles.avatarLg}>{initials}</div>
        <div>
          <h1 className={styles.title}>Welcome back, {first}!</h1>
          <p className={styles.subtitle}>{customer?.email}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <Link href="/account/orders" className={styles.statCard}>
          <div className={styles.statIconWrap} data-color="primary">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statValue}>{orderCount}</p>
            <p className={styles.statLabel}>Total Orders</p>
          </div>
        </Link>

        <Link href="/account/wishlist" className={styles.statCard}>
          <div className={styles.statIconWrap} data-color="pink">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statValue}>{wishCount}</p>
            <p className={styles.statLabel}>Wishlist Items</p>
          </div>
        </Link>

        <Link href="/account/addresses" className={styles.statCard}>
          <div className={styles.statIconWrap} data-color="blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div className={styles.statInfo}>
            <p className={styles.statValue}>Active</p>
            <p className={styles.statLabel}>Account</p>
          </div>
        </Link>

        {loyaltyEnabled ? (
          <div className={styles.statCard}>
            <div className={styles.statIconWrap} data-color="amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statValue}>{loyaltyBalance.toLocaleString()}</p>
              <p className={styles.statLabel}>Loyalty Points</p>
            </div>
          </div>
        ) : (
          <Link href="/account/subscriptions" className={styles.statCard}>
            <div className={styles.statIconWrap} data-color="amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
            </div>
            <div className={styles.statInfo}>
              <p className={styles.statValue}>24/7</p>
              <p className={styles.statLabel}>Support</p>
            </div>
          </Link>
        )}
      </div>

      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <Link href="/account/orders" className={styles.viewAll}>View all orders</Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h3>No orders yet</h3>
            <p>Start shopping and your orders will appear here.</p>
            <Link href="/shop" className={styles.shopBtn}>Browse products</Link>
          </div>
        ) : (
          <div className={styles.recentList}>
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className={styles.recentCard}>
                <div className={styles.recentCardLeft}>
                  <span className={styles.recentOrderNum}>{order.order_number || `#${order.id}`}</span>
                  <span className={styles.recentDate}>{formatShopDate(order.created_at, shopTimeZone)}</span>
                </div>
                <div className={styles.recentCardRight}>
                  <span className={`${styles.miniStatusBadge} ${styles[statusClass(order.status || "pending")]}`}>
                    {order.status || "pending"}
                  </span>
                  <span className={styles.recentTotal}>
                    {order.currency || "EUR"} {order.total != null ? Number(order.total).toFixed(2) : "—"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
