import { serverApiGet } from "@/lib/server-api";
import type { OrderSummary } from "@/types/api";
import OrdersClient from "./OrdersClient";
import styles from "./orders.module.css";

export default async function OrdersPage() {
  const data = await serverApiGet<{ orders: OrderSummary[] }>("/storefront/customer/orders?limit=50");
  const orders = data?.orders || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Order History</h1>
          <p className={styles.subtitle}>Showing your most recent 50 orders.</p>
        </div>
      </div>

      <OrdersClient orders={orders} />
    </div>
  );
}
