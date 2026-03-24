import Link from "next/link";
import { notFound } from "next/navigation";
import { serverApiGet } from "@/lib/server-api";
import styles from "../orders.module.css";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await serverApiGet<{ order: Record<string, unknown> }>(`/storefront/customer/orders/${id}`);
  if (!data?.order) notFound();

  const order = data.order as {
    id: number;
    order_number?: string;
    status?: string;
    payment_status?: string;
    total?: string;
    currency?: string;
    items?: { id: number; name?: string; quantity?: number; price?: string }[];
  };

  return (
    <div className={styles.container}>
      <Link href="/account/orders" className={styles.viewDetailsBtn} style={{ marginBottom: 16, display: "inline-block" }}>
        ← Back to orders
      </Link>
      <h1 className={styles.title}>Order {order.order_number || order.id}</h1>
      <p>
        Status: {order.status} · Payment: {order.payment_status}
      </p>
      <p>
        Total: {order.currency} {order.total != null ? Number(order.total).toFixed(2) : "—"}
      </p>
      <h2 style={{ marginTop: 24 }}>Items</h2>
      <ul>
        {(order.items || []).map((item) => (
          <li key={item.id}>
            {item.name} × {item.quantity} @ {item.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
