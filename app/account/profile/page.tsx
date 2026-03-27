"use client";

import { useEffect, useState } from "react";
import { User, Mail, Phone, Save, Info } from "lucide-react";
import { apiGet, apiPut } from "@/lib/api";
import type { Customer } from "@/types/api";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    apiGet<{ customer: Customer }>("/storefront/customer/profile")
      .then((d) => {
        const c = d.customer;
        setFormData({
          first_name: c.first_name || "",
          last_name: c.last_name || "",
          email: c.email || "",
          phone: c.phone || "",
        });
      })
      .catch(() => setError("Failed to load profile data."));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await apiPut("/storefront/customer/profile", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save profile. Please try again.";
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile Information</h1>
        <p className={styles.subtitle}>Update your account details and settings.</p>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className={styles.errorClose} aria-label="Dismiss">✕</button>
        </div>
      )}

      <div className={styles.card}>
        <form onSubmit={handleSaveProfile} className={styles.form}>
          <h2 className={styles.sectionTitle}>Personal Details</h2>

          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label htmlFor="first_name" className={styles.label}>
                First name
              </label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={20} />
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="last_name" className={styles.label}>
                Last name
              </label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={20} />
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={20} />
                <input id="email" name="email" type="email" value={formData.email} className={`${styles.input} ${styles.readonlyInput}`} readOnly />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>
                Phone Number
              </label>
              <div className={styles.inputWrapper}>
                <Phone className={styles.inputIcon} size={20} />
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className={styles.input} />
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            {success && <span className={styles.successMessage}>Profile updated successfully!</span>}
            <button type="submit" disabled={isSaving} className={`${styles.saveButton} ${isSaving ? styles.loading : ""}`}>
              {isSaving ? <div className={styles.spinner}></div> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className={styles.infoCallout}>
        <Info size={18} className={styles.infoIcon} />
        <div>
          <strong>Need to change your password?</strong>
          <p>Password changes are managed by our support team. Please contact us and we&apos;ll assist you promptly.</p>
        </div>
      </div>
    </div>
  );
}
