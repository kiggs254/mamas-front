"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./Checkout.module.css";
import { ShieldIcon, ArrowRightIcon } from "../components/Icons";
import { useCart } from "@/hooks/useCart";
import { apiGet, apiPost } from "@/lib/api";
import { productPrimaryImage } from "@/lib/products";
import type { CartLine, StorefrontProduct, ProductVariant } from "@/types/api";

type Country = { code: string; name: string; states: { code: string; name: string }[] };
type ShipMethod = { id: number | string; name: string; cost?: string | number; type?: string };
type Gateway = { id: number; name: string; config?: Record<string, unknown> };

function lineUnitPrice(line: CartLine): number {
  const v = line.variant as ProductVariant | null | undefined;
  if (v && v.price != null) {
    const vp = Number(v.price);
    const vs = v.sale_price != null ? Number(v.sale_price) : null;
    if (vs != null && !Number.isNaN(vs) && vs > 0 && vs < vp) return vs;
    return vp;
  }
  const p = line.product as StorefrontProduct | undefined;
  if (!p) return 0;
  const sale = p.sale_price != null ? Number(p.sale_price) : null;
  const base = Number(p.price) || 0;
  if (sale != null && sale > 0 && sale < base) return sale;
  return base;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cartData, mutate } = useCart();
  const items = cartData?.items || [];

  const [countries, setCountries] = useState<Country[]>([]);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [shipMethods, setShipMethods] = useState<ShipMethod[]>([]);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("Nairobi");
  const [state, setState] = useState("Nairobi");
  const [postal, setPostal] = useState("");
  const [countryCode, setCountryCode] = useState("KE");

  const [coupon, setCoupon] = useState("");
  const [discountPreview, setDiscountPreview] = useState<number | null>(null);
  const [couponError, setCouponError] = useState("");

  const [selectedShipKey, setSelectedShipKey] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneOrderId, setDoneOrderId] = useState<number | null>(null);

  useEffect(() => {
    apiGet<{ countries: Country[] }>("/storefront/locations/countries")
      .then((d) => setCountries(d.countries || []))
      .catch(() => {});
    apiGet<{ gateways: Gateway[] }>("/storefront/checkout/payment-gateways")
      .then((d) => {
        const g = d.gateways || [];
        setGateways(g);
        if (g[0]?.name) setPaymentMethod(g[0].name);
      })
      .catch(() => {});
  }, []);

  const cartPayload = useMemo(
    () =>
      items.map((line) => ({
        product_id: line.product_id,
        variant_id: line.variant_id ?? undefined,
        quantity: line.quantity,
      })),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((acc, line) => acc + lineUnitPrice(line) * line.quantity, 0),
    [items]
  );

  useEffect(() => {
    if (!email.trim() || cartPayload.length === 0) return;
    const t = window.setTimeout(() => {
      apiPost("/storefront/marketing/abandoned-carts", {
        email: email.trim(),
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        phone: phone || undefined,
        cart_items: cartPayload,
        total_amount: subtotal,
        currency: "KES",
      }).catch(() => {});
    }, 2500);
    return () => window.clearTimeout(t);
  }, [email, firstName, lastName, phone, cartPayload, subtotal]);

  const selectedShip = shipMethods.find((m) => String(m.id) === selectedShipKey);
  const shipCost = selectedShip ? Number(selectedShip.cost || 0) : 0;
  const discount = discountPreview ?? 0;
  const total = Math.max(0, subtotal + shipCost - discount);

  const refreshShipping = async () => {
    setError("");
    if (!countryCode || cartPayload.length === 0) return;
    try {
      const res = await apiPost<{ methods: ShipMethod[] }>("/storefront/checkout/calculate-shipping", {
        country: countryCode,
        state,
        city,
        address: address1,
        postal_code: postal,
        items: cartPayload,
      });
      const methods = res.methods || [];
      setShipMethods(methods);
      if (methods[0]?.id != null) setSelectedShipKey(String(methods[0].id));
    } catch (e: unknown) {
      setShipMethods([]);
      setError(e instanceof Error ? e.message : "Could not calculate shipping");
    }
  };

  const validateCoupon = async () => {
    setCouponError("");
    setDiscountPreview(null);
    if (!coupon.trim() || cartPayload.length === 0) return;
    try {
      const res = await apiPost<{
        discount: number;
      }>("/storefront/checkout/validate-coupon", {
        coupon_code: coupon.trim(),
        items: cartPayload,
      });
      setDiscountPreview(Number(res.discount) || 0);
    } catch (e: unknown) {
      setCouponError(e instanceof Error ? e.message : "Invalid coupon");
    }
  };

  const placeOrder = async () => {
    setBusy(true);
    setError("");
    try {
      if (!email || !address1 || !countryCode) {
        setError("Email and street address are required.");
        return;
      }
      if (!paymentMethod) {
        setError("Select a payment method.");
        return;
      }
      if (!selectedShipKey) {
        setError("Calculate and select shipping.");
        return;
      }

      const shipping_method_id = /^\d+$/.test(selectedShipKey) ? Number(selectedShipKey) : selectedShipKey;

      const orderRes = await apiPost<{ order: { id: number; order_number?: string } }>(
        "/storefront/checkout/create-order",
        {
          customer: {
            email,
            first_name: firstName,
            last_name: lastName,
            phone,
          },
          shipping_address: {
            first_name: firstName || "Customer",
            last_name: lastName || "",
            address_1: address1,
            address_2: address2 || undefined,
            city,
            state,
            postal_code: postal,
            country: countryCode,
          },
          billing_address: { same_as_shipping: true },
          items: cartPayload,
          shipping_method_id,
          payment_method: paymentMethod,
          coupon_code: coupon.trim() || undefined,
        }
      );

      const orderId = orderRes.order?.id;
      if (orderId) {
        try {
          await apiPost("/storefront/checkout/process-payment", {
            order_id: orderId,
            gateway_name: paymentMethod,
            payment_data: { phone },
          });
        } catch {
          /* gateways may complete async */
        }
      }

      setDoneOrderId(orderId ?? null);
      await mutate();
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  if (doneOrderId) {
    return (
      <div className={styles.checkoutPage}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/" className={styles.logo}>
              <img src="/images/logo.png" alt="Cleanshelf Supermarket" />
            </Link>
          </div>
        </header>
        <main className={styles.main}>
          <div className={styles.container}>
            <h1>Thank you!</h1>
            <p>Your order was placed (reference #{doneOrderId}).</p>
            <Link href="/account/orders">View orders</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.checkoutPage}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            <img src="/images/logo.png" alt="Cleanshelf Supermarket" />
          </Link>
          <div className={styles.secureBadge}>
            <ShieldIcon size={18} color="var(--color-primary)" />
            Secure Checkout
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          {items.length === 0 ? (
            <p>
              Your cart is empty. <Link href="/shop">Shop</Link>
            </p>
          ) : (
            <>
              <div className={styles.formsPanel}>
                {error && <p style={{ color: "coral", marginBottom: 12 }}>{error}</p>}

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.stepNumber}>1</span> Contact Information
                  </h2>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                      <label>Email Address</label>
                      <input
                        type="email"
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>First Name</label>
                      <input className={styles.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Last Name</label>
                      <input className={styles.input} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                      <label>Phone Number</label>
                      <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.stepNumber}>2</span> Shipping Address
                  </h2>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                      <label>Country</label>
                      <select
                        className={styles.select}
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                      >
                        {countries.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                      <label>Street Address</label>
                      <input className={styles.input} value={address1} onChange={(e) => setAddress1(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                      <label>Apartment (optional)</label>
                      <input className={styles.input} value={address2} onChange={(e) => setAddress2(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>City</label>
                      <input className={styles.input} value={city} onChange={(e) => setCity(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>State / County</label>
                      <input className={styles.input} value={state} onChange={(e) => setState(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Postal code</label>
                      <input className={styles.input} value={postal} onChange={(e) => setPostal(e.target.value)} />
                    </div>
                    <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                      <button type="button" className={styles.submitBtn} onClick={refreshShipping}>
                        Calculate shipping
                      </button>
                    </div>
                    {shipMethods.length > 0 && (
                      <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                        <label>Shipping method</label>
                        <select
                          className={styles.select}
                          value={selectedShipKey}
                          onChange={(e) => setSelectedShipKey(e.target.value)}
                        >
                          {shipMethods.map((m) => (
                            <option key={String(m.id)} value={String(m.id)}>
                              {m.name} — KES {Number(m.cost || 0).toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.stepNumber}>3</span> Coupon
                  </h2>
                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup} style={{ gridColumn: "1 / -1" }}>
                      <label>Coupon code</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input className={styles.input} value={coupon} onChange={(e) => setCoupon(e.target.value)} />
                        <button type="button" className={styles.submitBtn} onClick={validateCoupon}>
                          Apply
                        </button>
                      </div>
                      {couponError && <p style={{ color: "coral", fontSize: 13 }}>{couponError}</p>}
                      {discountPreview != null && discountPreview > 0 && (
                        <p style={{ color: "green", fontSize: 14 }}>Discount: KES {discountPreview.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.stepNumber}>4</span> Payment Method
                  </h2>
                  <div className={styles.paymentOptions}>
                    {gateways.map((g) => (
                      <label
                        key={g.id}
                        className={`${styles.paymentOption} ${paymentMethod === g.name ? styles.active : ""}`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={g.name}
                          checked={paymentMethod === g.name}
                          onChange={() => setPaymentMethod(g.name)}
                        />
                        <div className={styles.paymentInfo}>
                          <span className={styles.paymentName}>{g.name}</span>
                          <span className={styles.paymentDesc}>
                            {(g.config?.description as string) || (g.config?.title as string) || " "}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="button" className={styles.submitBtn} disabled={busy} onClick={placeOrder}>
                  {busy ? "Placing order…" : "Place Order"} <ArrowRightIcon size={16} color="white" />
                </button>
              </div>

              <div className={styles.summaryContainer}>
                <div className={styles.summaryPanel}>
                  <h2 className={styles.summaryTitle}>Order Summary</h2>
                  <div className={styles.itemList}>
                    {items.map((line) => {
                      const p = line.product as StorefrontProduct | undefined;
                      const img = p ? productPrimaryImage(p) : "";
                      const unit = lineUnitPrice(line);
                      return (
                        <div key={line.id} className={styles.item}>
                          <div className={styles.itemImage}>
                            {img ? (
                              <Image src={img} alt="" width={48} height={48} style={{ objectFit: "contain" }} />
                            ) : (
                              "📦"
                            )}
                          </div>
                          <div className={styles.itemDetails}>
                            <div className={styles.itemName}>{p?.name || "Item"}</div>
                            <div className={styles.itemQty}>Qty: {line.quantity}</div>
                          </div>
                          <div className={styles.itemPrice}>KES {(unit * line.quantity).toFixed(2)}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.totals}>
                    <div className={styles.totalRow}>
                      <span>Subtotal</span>
                      <span>KES {subtotal.toFixed(2)}</span>
                    </div>
                    <div className={styles.totalRow}>
                      <span>Shipping</span>
                      <span>KES {shipCost.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className={styles.totalRow}>
                        <span>Discount</span>
                        <span>-KES {discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className={styles.totalRow}>
                      <span>Tax</span>
                      <span>Included</span>
                    </div>
                    <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                      <span>Total</span>
                      <span className={styles.grandTotalAmount}>KES {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2024 Cleanshelf Supermarket. All rights reserved. Secured by SSL Checkout.</p>
      </footer>
    </div>
  );
}
