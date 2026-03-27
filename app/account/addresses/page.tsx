"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Edit2, Trash2, CheckCircle, Save, X, Star } from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import styles from "./addresses.module.css";

type Addr = {
  id: number;
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string | null;
  city?: string;
  state?: string | null;
  postal_code?: string | null;
  country?: string;
  is_default?: boolean;
};

const emptyForm = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "Kenya",
};

export default function AddressesPage() {
  const [list, setList] = useState<Addr[]>([]);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingDefault, setLoadingDefault] = useState<number | null>(null);

  const load = () => {
    apiGet<{ addresses: Addr[] }>("/storefront/customer/addresses")
      .then((d) => setList(d.addresses || []))
      .catch(() => setList([]));
  };

  useEffect(() => {
    load();
  }, []);

  const startNew = () => {
    setForm(emptyForm);
    setError(null);
    setEditing("new");
  };

  const startEdit = (a: Addr) => {
    setForm({
      first_name: a.first_name || "",
      last_name: a.last_name || "",
      address_1: a.address_1 || "",
      address_2: a.address_2 || "",
      city: a.city || "",
      state: a.state || "",
      postal_code: a.postal_code || "",
      country: a.country || "Kenya",
    });
    setError(null);
    setEditing(a.id);
  };

  const cancel = () => {
    setEditing(null);
    setError(null);
  };

  const save = async () => {
    if (!form.first_name || !form.address_1 || !form.city) {
      setError("First name, address line 1, and city are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing === "new") {
        await apiPost("/storefront/customer/addresses", form);
      } else if (typeof editing === "number") {
        await apiPut(`/storefront/customer/addresses/${editing}`, form);
      }
      setEditing(null);
      load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this address?")) return;
    await apiDelete(`/storefront/customer/addresses/${id}`);
    load();
  };

  const setDefault = async (id: number) => {
    setLoadingDefault(id);
    try {
      await apiPut(`/storefront/customer/addresses/${id}`, { is_default: true });
      load();
    } finally {
      setLoadingDefault(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Address Book</h1>
          <p className={styles.subtitle}>Manage your shipping and billing addresses.</p>
        </div>
        <button type="button" className={styles.addButton} onClick={startNew}>
          <Plus size={18} /> Add New Address
        </button>
      </div>

      {editing !== null && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>{editing === "new" ? "New Address" : "Edit Address"}</h3>

          {error && (
            <div className={styles.formError}>
              <span>{error}</span>
              <button type="button" onClick={() => setError(null)} aria-label="Dismiss">✕</button>
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>First name <span className={styles.req}>*</span></label>
              <input className={styles.input} placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Last name</label>
              <input className={styles.input} placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <div className={`${styles.inputGroup} ${styles.span2}`}>
              <label className={styles.label}>Address line 1 <span className={styles.req}>*</span></label>
              <input className={styles.input} placeholder="Street address" value={form.address_1} onChange={(e) => setForm({ ...form, address_1: e.target.value })} />
            </div>
            <div className={`${styles.inputGroup} ${styles.span2}`}>
              <label className={styles.label}>Address line 2</label>
              <input className={styles.input} placeholder="Apartment, suite, etc. (optional)" value={form.address_2} onChange={(e) => setForm({ ...form, address_2: e.target.value })} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>City <span className={styles.req}>*</span></label>
              <input className={styles.input} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>State / County</label>
              <input className={styles.input} placeholder="State or county" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Postal code</label>
              <input className={styles.input} placeholder="Postal code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Country</label>
              <input className={styles.input} placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={cancel} disabled={saving}>
              <X size={16} /> Cancel
            </button>
            <button type="button" className={styles.saveBtn} onClick={save} disabled={saving}>
              {saving ? <span className={styles.spinner} /> : <Save size={16} />}
              {saving ? "Saving…" : "Save Address"}
            </button>
          </div>
        </div>
      )}

      <div className={styles.addressGrid}>
        {list.map((address) => (
          <div key={address.id} className={`${styles.addressCard} ${address.is_default ? styles.defaultCard : ""}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleWrapper}>
                <MapPin className={styles.icon} size={20} />
                <h3 className={styles.cardTitle}>Shipping</h3>
              </div>
              {address.is_default && (
                <span className={styles.defaultBadge}>
                  <CheckCircle size={14} className={styles.checkIcon} /> Default
                </span>
              )}
            </div>

            <div className={styles.cardBody}>
              <p className={styles.name}>
                {address.first_name} {address.last_name}
              </p>
              <p className={styles.addressLine}>{address.address_1}</p>
              {address.address_2 && <p className={styles.addressLine}>{address.address_2}</p>}
              <p className={styles.addressLine}>
                {[address.city, address.state, address.postal_code].filter(Boolean).join(", ")}
              </p>
              <p className={styles.addressLine}>{address.country}</p>
            </div>

            <div className={styles.cardActions}>
              {!address.is_default && (
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => setDefault(address.id)}
                  disabled={loadingDefault === address.id}
                >
                  <Star size={15} /> {loadingDefault === address.id ? "…" : "Set default"}
                </button>
              )}
              <button type="button" className={styles.actionBtn} onClick={() => startEdit(address)}>
                <Edit2 size={15} /> Edit
              </button>
              <button type="button" className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => remove(address.id)}>
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        ))}

        <button type="button" className={styles.addNewCard} onClick={startNew}>
          <div className={styles.addIconWrapper}>
            <Plus size={24} />
          </div>
          <span>Add New Address</span>
        </button>
      </div>
    </div>
  );
}
