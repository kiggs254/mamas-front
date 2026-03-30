"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Package, Search } from "lucide-react";
import type { OrderSummary } from "@/types/api";
import { formatShopDate } from "@/lib/shop-datetime";
import styles from "./orders.module.css";

function statusClass(s?: string) {
  return (s || "pending").toLowerCase().replace(/\s+/g, "_");
}

export default function OrdersClient({
  orders,
  shopTimeZone,
}: {
  orders: OrderSummary[];
  shopTimeZone?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const num = (o.order_number || String(o.id)).toLowerCase();
      const status = (o.status || "").toLowerCase();
      return num.includes(q) || status.includes(q);
    });
  }, [orders, query]);

  return (
    <>
      <div className={styles.searchWrapper}>
        <Search className={styles.searchIcon} size={18} />
        <input
          type="search"
          placeholder="Filter by order # or status…"
          className={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className={styles.ordersList}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            {orders.length === 0 ? (
              <>
                <Package size={40} className={styles.emptyIcon} />
                <p>No orders yet. <Link href="/shop">Browse products</Link></p>
              </>
            ) : (
              <p>No orders match &ldquo;{query}&rdquo;.</p>
            )}
          </div>
        ) : (
          filtered.map((order) => {
            const itemCount = Array.isArray(order.items) ? order.items.length : null;
            return (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderInfo}>
                    <span className={styles.orderId}>{order.order_number || `#${order.id}`}</span>
                    <span className={styles.orderDate}>{formatShopDate(order.created_at, shopTimeZone)}</span>
                  </div>
                  <div className={styles.orderStatusContainer}>
                    <span className={`${styles.statusBadge} ${styles[statusClass(order.status)]}`}>
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
                    <span>
                      {itemCount !== null ? `${itemCount} item${itemCount !== 1 ? "s" : ""}` : ""}
                      {itemCount !== null && order.payment_status ? " · " : ""}
                      {order.payment_status ? `Payment: ${order.payment_status}` : ""}
                    </span>
                  </div>
                  <Link href={`/account/orders/${order.id}`} className={styles.viewDetailsBtn}>
                    View Details
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
