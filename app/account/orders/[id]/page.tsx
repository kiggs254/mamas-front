import Link from "next/link";
import { notFound } from "next/navigation";
import { serverApiGet } from "@/lib/server-api";
import styles from "../orders.module.css";

type OrderItem = {
  id: number;
  name?: string;
  sku?: string;
  quantity?: number;
  price?: string | number;
  subtotal?: string | number;
  product_id?: number;
};

type ShippingAddress = {
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string | null;
  city?: string;
  state?: string | null;
  postal_code?: string | null;
  country?: string;
};

type OrderDetail = {
  id: number;
  order_number?: string;
  status?: string;
  payment_status?: string;
  subtotal?: string | number;
  shipping_total?: string | number;
  total?: string | number;
  currency?: string;
  created_at?: string;
  items?: OrderItem[];
  shipping_address?: ShippingAddress | null;
};

function fmt(v?: string | number | null, currency = "KES") {
  if (v == null) return "—";
  return `${currency} ${Number(v).toFixed(2)}`;
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" });
}

function statusCls(s?: string) {
  return (s || "pending").toLowerCase().replace(/\s+/g, "_");
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await serverApiGet<{ order: OrderDetail }>(`/storefront/customer/orders/${id}`);
  if (!data?.order) notFound();

  const order = data.order;
  const currency = order.currency || "KES";
  const items = order.items || [];
  const addr = order.shipping_address;

  const subtotal = order.subtotal ?? items.reduce((sum, i) => sum + Number(i.subtotal ?? (Number(i.price || 0) * Number(i.quantity || 0))), 0);
  const shipping = order.shipping_total;

  return (
    <div className={styles.detailContainer}>
      <Link href="/account/orders" className={styles.backLink}>
        ← Back to orders
      </Link>

      <div className={styles.detailHeaderStrip}>
        <div>
          <h1 className={styles.detailOrderNum}>Order {order.order_number || `#${order.id}`}</h1>
          <span className={styles.detailDate}>Placed {formatDate(order.created_at)}</span>
        </div>
        <div className={styles.detailBadges}>
          <span className={`${styles.statusBadge} ${styles[statusCls(order.status)]}`}>
            {order.status || "pending"}
          </span>
          {order.payment_status && (
            <span className={`${styles.payBadge} ${styles[statusCls(order.payment_status)]}`}>
              {order.payment_status}
            </span>
          )}
        </div>
      </div>

      <div className={styles.detailLayout}>
        {/* Left column: items + summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className={styles.detailCard}>
            <h2 className={styles.detailCardTitle}>Order Items</h2>
            {items.length === 0 ? (
              <p style={{ padding: "1.25rem", color: "var(--color-text)", margin: 0 }}>No items found.</p>
            ) : (
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th className={styles.tdRight}>Price</th>
                    <th className={styles.tdRight}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const lineTotal = item.subtotal ?? (Number(item.price || 0) * Number(item.quantity || 0));
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className={styles.itemName}>{item.name || `Product #${item.product_id}`}</div>
                          {item.sku && <div className={styles.itemSku}>SKU: {item.sku}</div>}
                        </td>
                        <td>{item.quantity ?? 1}</td>
                        <td className={styles.tdRight}>{fmt(item.price, currency)}</td>
                        <td className={styles.tdRight}>{fmt(lineTotal, currency)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.detailCard}>
            <h2 className={styles.detailCardTitle}>Order Summary</h2>
            <div className={styles.summaryBlock}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{fmt(subtotal, currency)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{shipping != null ? fmt(shipping, currency) : "—"}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total</span>
                <span>{fmt(order.total, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: shipping address */}
        <div>
          {addr && (
            <div className={styles.detailCard}>
              <h2 className={styles.detailCardTitle}>Shipping Address</h2>
              <div className={styles.addressBlock}>
                <p className={styles.addressName}>{addr.first_name} {addr.last_name}</p>
                <p className={styles.addressLine}>{addr.address_1}</p>
                {addr.address_2 && <p className={styles.addressLine}>{addr.address_2}</p>}
                <p className={styles.addressLine}>
                  {[addr.city, addr.state, addr.postal_code].filter(Boolean).join(", ")}
                </p>
                <p className={styles.addressLine}>{addr.country}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
