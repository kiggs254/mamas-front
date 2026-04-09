"use client";

import Link from "next/link";

export default function AccountError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <h2 style={{ fontSize: 20, marginBottom: 8 }}>Something went wrong</h2>
      <p style={{ color: "#666", marginBottom: 16 }}>{error.message || "Unable to load account."}</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid #ccc", cursor: "pointer", background: "#fff" }}
        >
          Try again
        </button>
        <Link href="/login" style={{ padding: "8px 20px", borderRadius: 6, background: "var(--color-primary, #E8751A)", color: "#fff", textDecoration: "none" }}>
          Log in again
        </Link>
      </div>
    </div>
  );
}
