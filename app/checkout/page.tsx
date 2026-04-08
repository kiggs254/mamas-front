"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./Checkout.module.css";
import { ShieldIcon, ArrowRightIcon } from "../components/Icons";
import { useCart } from "@/hooks/useCart";
import { apiGet, apiPost } from "@/lib/api";
import { readSelectedBranch, writeSelectedBranch, parseNumericBranchId } from "@/lib/branch-selection";
import AddressAutocomplete, { type PlaceResolved } from "../components/AddressAutocomplete";
import { productPrimaryImage } from "@/lib/products";
import type { CartLine, StorefrontProduct, ProductVariant, StoreLocatorBranch, StoreLocatorConfig } from "@/types/api";

// Kenya counties — matches the backend countries.ts data
const KENYA_COUNTIES = [
  "Mombasa","Kwale","Kilifi","Tana River","Lamu","Taita-Taveta","Garissa","Wajir","Mandera",
  "Marsabit","Isiolo","Meru","Tharaka-Nithi","Embu","Kitui","Machakos","Makueni","Nyandarua",
  "Nyeri","Kirinyaga","Murang'a","Kiambu","Turkana","West Pokot","Samburu","Trans Nzoia",
  "Uasin Gishu","Elgeyo-Marakwet","Nandi","Baringo","Laikipia","Nakuru","Narok","Kajiado",
  "Kericho","Bomet","Kakamega","Vihiga","Bungoma","Busia","Siaya","Kisumu","Homa Bay",
  "Migori","Kisii","Nyamira","Nairobi City",
];

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

  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [shipMethods, setShipMethods] = useState<ShipMethod[]>([]);

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("Nairobi City");

  const [coupon, setCoupon] = useState("");
  const [discountPreview, setDiscountPreview] = useState<number | null>(null);
  const [couponError, setCouponError] = useState("");

  const [selectedShipKey, setSelectedShipKey] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  const [calcBusy, setCalcBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [doneOrderId, setDoneOrderId] = useState<number | null>(null);

  const [checkoutBranchId, setCheckoutBranchId] = useState<number | undefined>(undefined);
  const [branchesEnabledShop, setBranchesEnabledShop] = useState(false);
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
  const [distanceCheckoutConfig, setDistanceCheckoutConfig] = useState<{
    enabled: boolean;
    google_maps_api_key: string;
  } | null>(null);

  type LoyaltyCfg = {
    enabled: boolean;
    points_per_currency_discount: number;
    min_points_to_redeem: number;
  };
  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyCfg | null>(null);
  const [loyaltyPreview, setLoyaltyPreview] = useState<{
    eligible: boolean;
    balance: number;
    max_redeemable_points: number;
    estimated_discount_max: number;
  } | null>(null);
  const [loyaltyModalOpen, setLoyaltyModalOpen] = useState(false);
  const [loyaltyStep, setLoyaltyStep] = useState<"send" | "otp" | "points">("send");
  const [loyaltyOtpChannel, setLoyaltyOtpChannel] = useState<"sms" | "whatsapp">("sms");
  const [otpCode, setOtpCode] = useState("");
  const [redemptionToken, setRedemptionToken] = useState<string | null>(null);
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0);
  const [loyaltyBusy, setLoyaltyBusy] = useState(false);
  const [loyaltyErr, setLoyaltyErr] = useState("");
  const [loyaltyPortalReady, setLoyaltyPortalReady] = useState(false);

  // Branch confirmation modal state
  const [branchConfirmOpen, setBranchConfirmOpen] = useState(false);
  const [branchList, setBranchList] = useState<StoreLocatorBranch[]>([]);
  const [branchListLoading, setBranchListLoading] = useState(false);
  const [selectedConfirmBranchId, setSelectedConfirmBranchId] = useState<string | null>(null);
  const branchConfirmedRef = useRef(false);

  useEffect(() => {
    setLoyaltyPortalReady(true);
  }, []);

  useEffect(() => {
    if (!loyaltyModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [loyaltyModalOpen]);

  useEffect(() => {
    if (!branchConfirmOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [branchConfirmOpen]);

  useEffect(() => {
    apiGet<{ config: LoyaltyCfg }>("/storefront/loyalty/config")
      .then((d) => setLoyaltyConfig(d.config))
      .catch(() => setLoyaltyConfig(null));
  }, []);

  useEffect(() => {
    const syncBranch = () => {
      const sel = readSelectedBranch();
      setCheckoutBranchId(parseNumericBranchId(sel?.id));
    };
    syncBranch();
    window.addEventListener("locationChange", syncBranch);
    return () => window.removeEventListener("locationChange", syncBranch);
  }, []);

  useEffect(() => {
    apiGet<{ settings: Record<string, string> }>("/storefront/settings")
      .then((d) => {
        const s = d?.settings;
        setBranchesEnabledShop(s?.branches_enabled === "true");
      })
      .catch(() => {});
  }, []);

  // Fetch branches and show confirmation modal when branches are enabled
  useEffect(() => {
    if (!branchesEnabledShop) return;
    if (branchConfirmedRef.current) return;
    const alreadyConfirmed = typeof window !== "undefined" && sessionStorage.getItem("cleanshelf_branch_confirmed") === "1";
    if (alreadyConfirmed) {
      branchConfirmedRef.current = true;
      return;
    }
    setBranchListLoading(true);
    apiGet<StoreLocatorConfig>("/storefront/store-locator")
      .then((config) => {
        const stores = config.stores ?? [];
        setBranchList(stores);
        if (stores.length > 0) {
          const current = readSelectedBranch();
          setSelectedConfirmBranchId(current?.id ?? null);
          setBranchConfirmOpen(true);
        }
      })
      .catch(() => {
        setBranchList([]);
      })
      .finally(() => setBranchListLoading(false));
  }, [branchesEnabledShop]);

  const confirmBranch = () => {
    if (!selectedConfirmBranchId) return;
    const branch = branchList.find((b) => b.id === selectedConfirmBranchId);
    if (branch) {
      writeSelectedBranch({ id: branch.id, name: branch.name, city: branch.city });
      setCheckoutBranchId(parseNumericBranchId(branch.id));
      window.dispatchEvent(new Event("locationChange"));
    }
    branchConfirmedRef.current = true;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cleanshelf_branch_confirmed", "1");
    }
    setBranchConfirmOpen(false);
  };

  const branchIdForApi = branchesEnabledShop && checkoutBranchId != null ? checkoutBranchId : undefined;

  useEffect(() => {
    if (!branchesEnabledShop || branchIdForApi == null) {
      setDistanceCheckoutConfig(null);
      return;
    }
    apiGet<{ config: { enabled: boolean; google_maps_api_key: string } }>(
      `/storefront/checkout/distance-based-shipping-config?branch_id=${branchIdForApi}`
    )
      .then((d) => setDistanceCheckoutConfig(d.config ?? null))
      .catch(() => setDistanceCheckoutConfig(null));
  }, [branchesEnabledShop, branchIdForApi]);

  const placesAutocompleteEnabled = Boolean(
    distanceCheckoutConfig?.enabled && distanceCheckoutConfig.google_maps_api_key?.trim()
  );
  const mapsApiKey = distanceCheckoutConfig?.google_maps_api_key?.trim() ?? "";

  useEffect(() => {
    const q = branchIdForApi != null ? `?branch_id=${branchIdForApi}` : "";
    apiGet<{ gateways: Gateway[] }>(`/storefront/checkout/payment-gateways${q}`)
      .then((d) => {
        const g = d.gateways || [];
        setGateways(g);
        if (g[0]?.name) setPaymentMethod(g[0].name);
      })
      .catch(() => {});
  }, [branchIdForApi]);

  const cartPayload = useMemo(
    () =>
      items.map((line) => ({
        product_id: line.product_id,
        variant_id: line.variant_id ?? undefined,
        quantity: line.quantity,
      })),
    [items]
  );

  const phoneLooksCompleteForLoyalty = useMemo(() => {
    const d = phone.replace(/\D/g, "");
    return d.length >= 9;
  }, [phone]);

  useEffect(() => {
    if (!loyaltyConfig?.enabled || !phoneLooksCompleteForLoyalty || cartPayload.length === 0) {
      setLoyaltyPreview(null);
      return;
    }
    const t = window.setTimeout(() => {
      apiPost<{
        eligible: boolean;
        balance: number;
        max_redeemable_points: number;
        estimated_discount_max: number;
      }>("/storefront/loyalty/preview", {
        phone: phone.trim(),
        ...(email.trim().includes("@") ? { email: email.trim() } : {}),
        items: cartPayload,
        ...(coupon.trim() ? { coupon_code: coupon.trim() } : {}),
      })
        .then((d) => setLoyaltyPreview(d))
        .catch(() => setLoyaltyPreview(null));
    }, 600);
    return () => window.clearTimeout(t);
  }, [phone, phoneLooksCompleteForLoyalty, email, cartPayload, coupon, loyaltyConfig?.enabled]);

  const subtotal = useMemo(
    () => items.reduce((acc, line) => acc + lineUnitPrice(line) * line.quantity, 0),
    [items]
  );

  // Abandoned cart tracking
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
  const couponDiscount = discountPreview ?? 0;
  const loyaltyDiscountAmount = useMemo(() => {
    if (!redemptionToken || loyaltyPointsToRedeem <= 0 || !loyaltyConfig) return 0;
    return loyaltyPointsToRedeem / loyaltyConfig.points_per_currency_discount;
  }, [redemptionToken, loyaltyPointsToRedeem, loyaltyConfig]);
  const total = Math.max(0, subtotal + shipCost - couponDiscount - loyaltyDiscountAmount);

  const onDeliveryPlaceResolved = useCallback((p: PlaceResolved) => {
    setAddress1(p.address1);
    if (p.city) setCity(p.city);
    setCounty(p.county);
    setDeliveryLat(p.lat);
    setDeliveryLng(p.lng);
  }, []);

  const refreshShipping = useCallback(async () => {
    if (cartPayload.length === 0) return;
    setCalcBusy(true);
    setError("");
    try {
      const latOk = deliveryLat != null && Number.isFinite(deliveryLat);
      const lngOk = deliveryLng != null && Number.isFinite(deliveryLng);
      const res = await apiPost<{ methods: ShipMethod[] }>("/storefront/checkout/calculate-shipping", {
        country: "Kenya",
        state: county,
        city: city || county,
        address: address1,
        items: cartPayload,
        ...(branchIdForApi != null ? { branch_id: branchIdForApi } : {}),
        ...(latOk && lngOk ? { latitude: deliveryLat, longitude: deliveryLng } : {}),
      });
      const methods = res.methods || [];
      setShipMethods(methods);
      if (methods[0]?.id != null) setSelectedShipKey(String(methods[0].id));
      else setSelectedShipKey("");
    } catch (e: unknown) {
      setShipMethods([]);
      setError(e instanceof Error ? e.message : "Could not calculate shipping");
    } finally {
      setCalcBusy(false);
    }
  }, [county, city, address1, cartPayload, branchIdForApi, deliveryLat, deliveryLng]);

  useEffect(() => {
    if (cartPayload.length === 0) return;
    const t = window.setTimeout(() => {
      refreshShipping();
    }, 420);
    return () => window.clearTimeout(t);
  }, [county, city, address1, branchIdForApi, deliveryLat, deliveryLng, cartPayload.length, refreshShipping]);

  const validateCoupon = async () => {
    setCouponError("");
    setDiscountPreview(null);
    if (!coupon.trim() || cartPayload.length === 0) return;
    try {
      const res = await apiPost<{ discount: number }>("/storefront/checkout/validate-coupon", {
        coupon_code: coupon.trim(),
        items: cartPayload,
      });
      setDiscountPreview(Number(res.discount) || 0);
    } catch (e: unknown) {
      setCouponError(e instanceof Error ? e.message : "Invalid coupon");
    }
  };

  const openLoyaltyModal = () => {
    setLoyaltyErr("");
    setOtpCode("");
    setLoyaltyStep("send");
    setLoyaltyOtpChannel("sms");
    setLoyaltyModalOpen(true);
  };

  const sendLoyaltyOtp = async () => {
    setLoyaltyErr("");
    setLoyaltyBusy(true);
    try {
      await apiPost("/storefront/loyalty/redemption/send-otp", {
        phone: phone.trim(),
        channel: loyaltyOtpChannel,
      });
      setLoyaltyStep("otp");
    } catch (e: unknown) {
      setLoyaltyErr(e instanceof Error ? e.message : "Could not send code");
    } finally {
      setLoyaltyBusy(false);
    }
  };

  const verifyLoyaltyOtp = async () => {
    setLoyaltyErr("");
    setLoyaltyBusy(true);
    try {
      const res = await apiPost<{ redemption_token: string; expires_in_minutes: number }>(
        "/storefront/loyalty/redemption/verify-otp",
        { phone: phone.trim(), code: otpCode.trim() }
      );
      setRedemptionToken(res.redemption_token);
      const max = loyaltyPreview?.max_redeemable_points ?? 0;
      setLoyaltyPointsToRedeem(max > 0 ? max : 0);
      setLoyaltyStep("points");
    } catch (e: unknown) {
      setLoyaltyErr(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setLoyaltyBusy(false);
    }
  };

  const applyLoyaltyPoints = () => {
    setLoyaltyModalOpen(false);
  };

  const clearLoyaltyRedemption = () => {
    setRedemptionToken(null);
    setLoyaltyPointsToRedeem(0);
    setOtpCode("");
    setLoyaltyStep("send");
  };

  useEffect(() => {
    setRedemptionToken(null);
    setLoyaltyPointsToRedeem(0);
    setOtpCode("");
    setLoyaltyStep("send");
  }, [phone]);

  const placeOrder = async () => {
    setError("");
    if (!email || !address1) {
      setError("Email and street address are required.");
      return;
    }
    if (!paymentMethod) {
      setError("Select a payment method.");
      return;
    }
    if (!selectedShipKey) {
      setError("Please wait for shipping to calculate, or select a shipping method.");
      return;
    }

    const shipping_method_id = /^\d+$/.test(selectedShipKey) ? Number(selectedShipKey) : selectedShipKey;
    if (
      String(shipping_method_id) === "distance-based-shipping" &&
      (deliveryLat == null ||
        deliveryLng == null ||
        !Number.isFinite(deliveryLat) ||
        !Number.isFinite(deliveryLng))
    ) {
      setError("Choose your street address from the suggestions so we can calculate distance-based delivery.");
      return;
    }

    setBusy(true);
    try {
      const latOk = deliveryLat != null && Number.isFinite(deliveryLat);
      const lngOk = deliveryLng != null && Number.isFinite(deliveryLng);

      const orderRes = await apiPost<{ order: { id: number; order_number?: string } }>(
        "/storefront/checkout/create-order",
        {
          customer: { email, first_name: firstName, last_name: lastName, phone },
          shipping_address: {
            first_name: firstName || "Customer",
            last_name: lastName || "",
            address_1: address1,
            address_2: address2 || undefined,
            city: city || county,
            state: county,
            country: "Kenya",
            ...(latOk && lngOk ? { latitude: deliveryLat, longitude: deliveryLng } : {}),
          },
          billing_address: { same_as_shipping: true },
          items: cartPayload,
          shipping_method_id,
          payment_method: paymentMethod,
          coupon_code: coupon.trim() || undefined,
          ...(branchIdForApi != null ? { branch_id: branchIdForApi } : {}),
          ...(redemptionToken && loyaltyPointsToRedeem > 0
            ? {
                loyalty_redemption: {
                  token: redemptionToken,
                  points: loyaltyPointsToRedeem,
                },
              }
            : {}),
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
              <img src="/images/logo.png" alt="Mama's Market" />
            </Link>
          </div>
        </header>
        <main className={styles.main}>
          <div className={styles.successWrap}>
            <div className={styles.successCard}>
              <div className={styles.successIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h1 className={styles.successTitle}>Order Placed!</h1>
              <p className={styles.successText}>
                Thank you for your order. Your order reference is <strong>#{doneOrderId}</strong>.
              </p>
              <p className={styles.successText}>We&apos;ll send you a confirmation shortly.</p>
              <div className={styles.successActions}>
                <Link href="/account/orders" className={styles.successBtn}>View My Orders</Link>
                <Link href="/shop" className={styles.successBtnOutline}>Continue Shopping</Link>
              </div>
            </div>
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
            <img src="/images/logo.png" alt="Mama's Market" />
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
            <div className={styles.emptyCart}>
              <p>Your cart is empty.</p>
              <Link href="/shop" className={styles.submitBtn} style={{ display: "inline-flex", width: "auto" }}>
                Shop Now
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.formsPanel}>
                {error && <div className={styles.errorBanner}>{error}</div>}

                {/* Step 1: Contact */}
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.stepNumber}>1</span> Contact Information
                  </h2>
                  <div className={styles.formGrid}>
                    <div className={`${styles.inputGroup} ${styles.spanFull}`}>
                      <label>Email Address *</label>
                      <input
                        type="email"
                        className={styles.input}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>First Name</label>
                      <input className={styles.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Last Name</label>
                      <input className={styles.input} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                    </div>
                    <div className={`${styles.inputGroup} ${styles.spanFull}`}>
                      <label>Phone Number</label>
                      <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 000 000" />
                      {loyaltyConfig?.enabled && loyaltyPreview?.eligible && phoneLooksCompleteForLoyalty && (
                        <p style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                          You can redeem loyalty points — see order summary.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2: Delivery */}
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.stepNumber}>2</span> Delivery Address
                  </h2>
                  <div className={styles.kenyaBadge}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Kenya
                  </div>
                  <div className={styles.formGrid}>
                    <div className={`${styles.inputGroup} ${styles.spanFull}`}>
                      <label>Street Address *</label>
                      <AddressAutocomplete
                        apiKey={mapsApiKey}
                        enabled={placesAutocompleteEnabled}
                        value={address1}
                        onChange={(v) => {
                          setAddress1(v);
                          setDeliveryLat(null);
                          setDeliveryLng(null);
                        }}
                        onPlaceResolved={onDeliveryPlaceResolved}
                        countyOptions={KENYA_COUNTIES}
                        className={styles.input}
                        placeholder={placesAutocompleteEnabled ? "Start typing; pick an address from suggestions" : "e.g. 123 Uhuru Highway"}
                      />
                    </div>
                    <div className={`${styles.inputGroup} ${styles.spanFull}`}>
                      <label>Apartment / Building (optional)</label>
                      <input className={styles.input} value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Apt, suite, floor..." />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Town / City</label>
                      <input className={styles.input} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Nairobi" />
                    </div>
                    <div className={styles.inputGroup}>
                      <label>County *</label>
                      <select
                        className={styles.select}
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                      >
                        {KENYA_COUNTIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Shipping methods */}
                  <div className={styles.shippingBox}>
                    {calcBusy ? (
                      <div className={styles.shippingLoading}>
                        <span className={styles.spinnerDark} />
                        Calculating shipping for {county}…
                      </div>
                    ) : shipMethods.length === 0 ? (
                      <div className={styles.shippingEmpty}>
                        <button type="button" className={styles.calcBtn} onClick={() => refreshShipping()} disabled={calcBusy}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg>
                          Check shipping rates
                        </button>
                      </div>
                    ) : (
                      <div className={styles.inputGroup}>
                        <label>Shipping method</label>
                        <div className={styles.shipMethodList}>
                          {shipMethods.map((m) => (
                            <label
                              key={String(m.id)}
                              className={`${styles.shipMethodOption} ${selectedShipKey === String(m.id) ? styles.shipMethodActive : ""}`}
                            >
                              <input
                                type="radio"
                                name="shipping"
                                value={String(m.id)}
                                checked={selectedShipKey === String(m.id)}
                                onChange={() => setSelectedShipKey(String(m.id))}
                              />
                              <span className={styles.shipMethodName}>{m.name}</span>
                              <span className={styles.shipMethodCost}>
                                {Number(m.cost || 0) === 0 ? "Free" : `KES ${Number(m.cost).toFixed(2)}`}
                              </span>
                            </label>
                          ))}
                        </div>
                        <button type="button" className={styles.recalcLink} onClick={() => refreshShipping()} disabled={calcBusy}>
                          {calcBusy ? "Recalculating…" : "↺ Recalculate"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 3: Coupon */}
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.stepNumber}>3</span> Coupon Code
                  </h2>
                  <div className={styles.couponRow}>
                    <input
                      className={styles.input}
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Enter coupon code"
                    />
                    <button type="button" className={styles.couponBtn} onClick={validateCoupon}>
                      Apply
                    </button>
                  </div>
                  {couponError && <p className={styles.couponError}>{couponError}</p>}
                  {discountPreview != null && discountPreview > 0 && (
                    <p className={styles.couponSuccess}>Discount: KES {discountPreview.toFixed(2)}</p>
                  )}
                </div>

                {/* Step 4: Payment */}
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}>
                    <span className={styles.stepNumber}>4</span> Payment Method
                  </h2>
                  {gateways.length === 0 ? (
                    <p className={styles.noGateways}>Loading payment options…</p>
                  ) : (
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
                              {(g.config?.description as string) || (g.config?.title as string) || ""}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Place order */}
                <button
                  type="button"
                  className={`${styles.submitBtn} ${busy ? styles.submitBusy : ""}`}
                  disabled={busy}
                  onClick={placeOrder}
                >
                  {busy ? (
                    <>
                      <span className={styles.spinner} />
                      Placing order…
                    </>
                  ) : (
                    <>
                      Place Order <ArrowRightIcon size={16} color="white" />
                    </>
                  )}
                </button>
              </div>

              {/* Order Summary */}
              <div className={styles.summaryContainer}>
                <div className={styles.summaryPanel}>
                  <h2 className={styles.summaryTitle}>Order Summary</h2>
                  {loyaltyConfig?.enabled && loyaltyPreview?.eligible && phoneLooksCompleteForLoyalty && (
                    <div style={{ marginBottom: 14 }}>
                      {!redemptionToken ? (
                        <button type="button" className={styles.couponBtn} onClick={openLoyaltyModal}>
                          Redeem loyalty points
                        </button>
                      ) : (
                        <div style={{ fontSize: 14 }}>
                          <span>
                            {loyaltyPointsToRedeem} pts (−KES {loyaltyDiscountAmount.toFixed(2)})
                          </span>
                          <button
                            type="button"
                            className={styles.recalcLink}
                            style={{ marginLeft: 10 }}
                            onClick={clearLoyaltyRedemption}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
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
                      <span>
                        {calcBusy ? (
                          <span className={styles.calcingText}>Calculating…</span>
                        ) : (
                          `KES ${shipCost.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className={styles.totalRow}>
                        <span>Coupon</span>
                        <span className={styles.discountAmt}>-KES {couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {loyaltyDiscountAmount > 0 && (
                      <div className={styles.totalRow}>
                        <span>Loyalty</span>
                        <span className={styles.discountAmt}>-KES {loyaltyDiscountAmount.toFixed(2)}</span>
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
        <p>© {new Date().getFullYear()} Mama's Market. All rights reserved. Secured by SSL.</p>
      </footer>

      {loyaltyPortalReady &&
        branchConfirmOpen &&
        createPortal(
          <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="branch-confirm-modal-title">
            <div className={styles.modalCard}>
              <h3 className={styles.modalTitle} id="branch-confirm-modal-title">
                Confirm Your Branch
              </h3>
              <p className={styles.modalText}>
                Please confirm which branch you&apos;d like to check out from:
              </p>
              {branchListLoading ? (
                <p className={styles.modalText} style={{ textAlign: "center" }}>Loading branches…</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto", marginBottom: 16 }}>
                  {branchList.map((branch) => (
                    <button
                      key={branch.id}
                      type="button"
                      onClick={() => setSelectedConfirmBranchId(branch.id)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "12px 14px",
                        borderRadius: 8,
                        border: selectedConfirmBranchId === branch.id
                          ? "2px solid var(--color-primary, #2563eb)"
                          : "1px solid var(--color-border, #e2e8f0)",
                        background: selectedConfirmBranchId === branch.id
                          ? "var(--color-primary-bg, #eff6ff)"
                          : "#fff",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14, color: "var(--color-heading, #1e293b)" }}>
                        {branch.name}
                      </span>
                      {(branch.address || branch.city) && (
                        <span style={{ display: "block", fontSize: 13, color: "var(--color-text-light, #64748b)", marginTop: 2 }}>
                          {[branch.address, branch.city].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.submitBtn}
                  disabled={!selectedConfirmBranchId}
                  onClick={confirmBranch}
                  style={{ opacity: selectedConfirmBranchId ? 1 : 0.5 }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {loyaltyPortalReady &&
        loyaltyModalOpen &&
        createPortal(
          <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="loyalty-modal-title">
          <div className={styles.modalCard}>
            <button
              type="button"
              className={styles.modalClose}
              onClick={() => setLoyaltyModalOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className={styles.modalTitle} id="loyalty-modal-title">
              Redeem loyalty points
            </h3>
            {loyaltyStep === "send" && (
              <>
                <p className={styles.modalText}>
                  Send a verification code to {phone.trim() || "your phone"} via SMS or WhatsApp.
                </p>
                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className={styles.couponBtn}
                    onClick={() => setLoyaltyOtpChannel("sms")}
                    style={
                      loyaltyOtpChannel === "sms"
                        ? { fontWeight: 700, outline: "2px solid currentColor" }
                        : undefined
                    }
                  >
                    SMS
                  </button>
                  <button
                    type="button"
                    className={styles.couponBtn}
                    onClick={() => setLoyaltyOtpChannel("whatsapp")}
                    style={
                      loyaltyOtpChannel === "whatsapp"
                        ? { fontWeight: 700, outline: "2px solid currentColor" }
                        : undefined
                    }
                  >
                    WhatsApp
                  </button>
                </div>
                {loyaltyErr && <p className={styles.couponError}>{loyaltyErr}</p>}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={sendLoyaltyOtp}
                    disabled={loyaltyBusy || !phone.trim()}
                  >
                    {loyaltyBusy ? "Sending…" : "Send code"}
                  </button>
                </div>
              </>
            )}
            {loyaltyStep === "otp" && (
              <>
                <p className={styles.modalText}>
                  Enter the {loyaltyOtpChannel === "whatsapp" ? "WhatsApp" : "SMS"} code we sent you.
                </p>
                <input
                  className={styles.input}
                  style={{ width: "100%", marginBottom: 8 }}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="6-digit code"
                  inputMode="numeric"
                />
                {loyaltyErr && <p className={styles.couponError}>{loyaltyErr}</p>}
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.submitBtn}
                    onClick={verifyLoyaltyOtp}
                    disabled={loyaltyBusy || !otpCode.trim()}
                  >
                    {loyaltyBusy ? "Checking…" : "Verify"}
                  </button>
                </div>
              </>
            )}
            {loyaltyStep === "points" && (
              <>
                <p className={styles.modalText}>
                  Balance {loyaltyPreview?.balance ?? 0} pts · Up to {loyaltyPreview?.max_redeemable_points ?? 0}{" "}
                  pts for this order.
                </p>
                {(loyaltyPreview?.max_redeemable_points ?? 0) <= 0 ? (
                  <p className={styles.couponError}>No points can be applied to this cart.</p>
                ) : (
                  <>
                    <input
                      type="range"
                      min={Math.min(
                        loyaltyConfig?.min_points_to_redeem ?? 1,
                        loyaltyPreview?.max_redeemable_points ?? 1
                      )}
                      max={loyaltyPreview?.max_redeemable_points ?? 0}
                      value={Math.min(loyaltyPointsToRedeem, loyaltyPreview?.max_redeemable_points ?? 0)}
                      onChange={(e) => setLoyaltyPointsToRedeem(Number(e.target.value))}
                      style={{ width: "100%" }}
                    />
                    <p className={styles.modalText}>
                      {loyaltyPointsToRedeem} pts · ~KES{" "}
                      {(
                        loyaltyPointsToRedeem / (loyaltyConfig?.points_per_currency_discount || 100)
                      ).toFixed(2)}{" "}
                      off
                    </p>
                  </>
                )}
                <div className={styles.modalActions}>
                  <button type="button" className={styles.submitBtn} onClick={applyLoyaltyPoints}>
                    Apply to order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>,
          document.body
        )}
    </div>
  );
}
