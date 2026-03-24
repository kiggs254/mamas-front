"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import styles from "../login/login.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BROWSER_BASE || "/api/v1"}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError((json as { message?: string }).message || "Request failed");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Reset password</h1>
          <p className={styles.subtitle}>
            Admin accounts: we&apos;ll email a reset link if the address exists. For storefront
            customers, contact support if you cannot sign in.
          </p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {done ? (
          <div className={styles.errorAlert} style={{ borderColor: "var(--color-primary, #3b82f6)" }}>
            <CheckCircle size={18} />
            <span>
              If an account exists with this email, you will receive a password reset link.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={20} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={styles.input}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`${styles.submitButton} ${isLoading ? styles.loading : ""}`}
            >
              {isLoading ? (
                <div className={styles.spinner}></div>
              ) : (
                <>
                  Send link <ArrowRight size={18} className={styles.arrowIcon} />
                </>
              )}
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <p className={styles.footerText}>
            <Link href="/login" className={styles.link}>
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
