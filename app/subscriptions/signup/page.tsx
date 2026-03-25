"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import shell from "../../styles/shell.module.css";
import styles from "../subscriptions.module.css";

function SignupForm() {
  const searchParams = useSearchParams();
  const packageId = Number(searchParams.get("package_id") || 0);

  const [email, setEmail] = useState("");
  const [first_name, setFirst] = useState("");
  const [last_name, setLast] = useState("");
  const [phone, setPhone] = useState("");
  const [address_1, setA1] = useState("");
  const [city, setCity] = useState("Nairobi");
  const [state, setState] = useState("Nairobi");
  const [country, setCountry] = useState("Kenya");
  const [preferred_delivery_day, setDay] = useState(1);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageId) {
      setMsg("Invalid package");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await apiPost<{ payment_link?: string | null }>("/storefront/subscription-signup", {
        package_id: packageId,
        email,
        first_name,
        last_name,
        phone,
        preferred_delivery_day,
        shipping_address: { address_1, city, state, country },
        storefront_url: origin,
        backend_url: origin,
      });
      if (res.payment_link) {
        window.location.href = res.payment_link;
        return;
      }
      setMsg("Subscription created. Check your email for payment instructions.");
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.signupPage}>
      <nav className={shell.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={shell.sep}>/</span>
        <Link href="/subscriptions">Subscriptions</Link>
        <span className={shell.sep}>/</span>
        <span>Sign up</span>
      </nav>

      <header className={styles.header}>
        <p className={styles.eyebrow}>Checkout</p>
        <h1 className={styles.title}>Complete subscription</h1>
        <div className={styles.titleUnderline} />
        <p className={styles.lead}>Enter your details and delivery address. Nairobi delivery only.</p>
      </header>

      <form className={styles.form} onSubmit={submit}>
        <input placeholder="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="First name" value={first_name} onChange={(e) => setFirst(e.target.value)} />
        <input placeholder="Last name" value={last_name} onChange={(e) => setLast(e.target.value)} />
        <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input placeholder="Street address" required value={address_1} onChange={(e) => setA1(e.target.value)} />
        <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <input placeholder="County / state" value={state} onChange={(e) => setState(e.target.value)} />
        <input placeholder="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
        <label>
          Delivery day (1 = Mon … 7 = Sun)
          <input
            type="number"
            min={1}
            max={7}
            value={preferred_delivery_day}
            onChange={(e) => setDay(Number(e.target.value))}
          />
        </label>
        <button type="submit" disabled={busy} className={styles.cta}>
          {busy ? "…" : "Continue to payment"}
        </button>
        {msg ? <p className={styles.formMsg}>{msg}</p> : null}
      </form>
    </div>
  );
}

export default function SubscriptionSignupPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.signupPage}>
          <p className={styles.lead}>Loading…</p>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
