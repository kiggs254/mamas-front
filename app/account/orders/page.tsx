import Link from "next/link";
import { Package, Search } from "lucide-react";
import { serverApiGet } from "@/lib/server-api";
import type { OrderSummary } from "@/types/api";
import styles from "./orders.module.css";

export default async function OrdersPage() {
  const data = await serverApiGet<{ orders: OrderSummary[] }>("/storefront/customer/orders?limit=50");
  const orders = data?.orders || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Order History</h1>
          <p className={styles.subtitle}>View and track all your recent orders.</p>
        </div>

        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <form action="/account/orders" method="get">
            <input type="search" name="q" placeholder="Filter in browser…" className={styles.searchInput} />
          </form>
        </div>
      </div>

      <div className={styles.ordersList}>
        {orders.length === 0 ? (
          <p>No orders yet. <Link href="/shop">Shop</Link></p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderInfo}>
                  <span className={styles.orderId}>{order.order_number || `#${order.id}`}</span>
                  <span className={styles.orderDate}>
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}
                  </span>
                </div>
                <div className={styles.orderStatusContainer}>
                  <span className={`${styles.statusBadge} ${styles[(order.status || "pending").toLowerCase()] || ""}`}>
                    {order.status || "pending"}
                  </span>
                  <p className={styles.orderTotal}>
                    {order.currency || "KES"} {order.total != null ? Number(order.total).toFixed(2) : "—"}
                  </p>
                </div>
              </div>

              <div className={styles.orderDetails}>
                <div className={styles.itemsSummary}>
                  <Package size={18} className={styles.packageIcon} />
                  <span>Payment: {order.payment_status || "—"}</span>
                </div>
                <Link href={`/account/orders/${order.id}`} className={styles.viewDetailsBtn}>
                  View Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
