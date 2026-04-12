"use client";

import { useState, useRef } from "react";
import styles from "./page.module.css";

interface LoyaltyOptInCardProps {
  registrationStatus: "pending" | "rejected" | null;
  optinIdRequired: boolean;
  rejectionReason?: string | null;
}

export function LoyaltyOptInCard({
  registrationStatus,
  optinIdRequired,
  rejectionReason,
}: LoyaltyOptInCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setIdFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }
    if (optinIdRequired && !idFile) {
      setError("Please upload a photo of your government ID.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("phone", phone.trim());
      if (idFile) formData.append("id_image", idFile);
      const res = await fetch("/api/v1/storefront/loyalty/register", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Submission failed. Please try again.");
      }
      setSubmitted(true);
      setModalOpen(false);
    } catch (err: any) {
      setError(err?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted || registrationStatus === "pending") {
    return (
      <div className={styles.statCard} style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
        <div className={styles.statIconWrap} data-color="amber">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div className={styles.statInfo}>
          <p className={styles.statValue} style={{ fontSize: "0.9rem" }}>Under Review</p>
          <p className={styles.statLabel}>Loyalty application pending</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        className={styles.statCard}
        style={{ flexDirection: "column", alignItems: "flex-start", gap: 4, cursor: "pointer", border: "2px dashed var(--border-color, #e5e7eb)" }}
        onClick={() => { setError(null); setModalOpen(true); }}
      >
        <div className={styles.statIconWrap} data-color="amber">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div className={styles.statInfo}>
          <p className={styles.statValue} style={{ fontSize: "0.9rem" }}>
            {registrationStatus === "rejected" ? "Re-apply" : "Join Loyalty"}
          </p>
          <p className={styles.statLabel}>
            {registrationStatus === "rejected" ? "Application rejected" : "Earn points on orders"}
          </p>
        </div>
      </button>

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div
            style={{
              background: "var(--card-bg, #fff)",
              borderRadius: 12,
              padding: "2rem",
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 4 }}>
              Join the Loyalty Program
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--muted, #6b7280)", marginBottom: "1.5rem" }}>
              Earn points on every order and redeem them at checkout.
            </p>

            {registrationStatus === "rejected" && rejectionReason && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "0.75rem", marginBottom: "1rem", fontSize: "0.8rem", color: "#b91c1c" }}>
                Previous rejection: {rejectionReason}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>
                  Full name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As it appears on your ID"
                  required
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.5rem 0.75rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>
                  Phone number <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +254712345678"
                  required
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.5rem 0.75rem", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {optinIdRequired && (
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>
                    Government ID (front) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div
                    style={{
                      border: "2px dashed #e5e7eb",
                      borderRadius: 8,
                      padding: "1rem",
                      textAlign: "center",
                      cursor: "pointer",
                      background: preview ? "transparent" : "#f9fafb",
                    }}
                    onClick={() => fileRef.current?.click()}
                  >
                    {preview ? (
                      <img src={preview} alt="ID preview" style={{ maxHeight: 120, borderRadius: 6, margin: "0 auto" }} />
                    ) : (
                      <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                        Click to upload a photo of your ID
                      </p>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {error && (
                <p style={{ fontSize: "0.8rem", color: "#ef4444" }}>{error}</p>
              )}

              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ flex: 1, padding: "0.625rem", border: "1px solid #e5e7eb", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: "0.875rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2,
                    padding: "0.625rem",
                    border: "none",
                    borderRadius: 8,
                    background: submitting ? "#9ca3af" : "var(--primary, #f97316)",
                    color: "#fff",
                    cursor: submitting ? "not-allowed" : "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
