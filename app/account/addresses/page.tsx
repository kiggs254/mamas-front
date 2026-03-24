"use client";

import { useEffect, useState } from "react";
import { MapPin, Plus, Edit2, Trash2, CheckCircle } from "lucide-react";
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
    setEditing(a.id);
  };

  const save = async () => {
    if (editing === "new") {
      await apiPost("/storefront/customer/addresses", form);
    } else if (typeof editing === "number") {
      await apiPut(`/storefront/customer/addresses/${editing}`, form);
    }
    setEditing(null);
    load();
  };

  const remove = async (id: number) => {
    await apiDelete(`/storefront/customer/addresses/${id}`);
    load();
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
        <div className={styles.addressCard} style={{ marginBottom: 24 }}>
          <h3>{editing === "new" ? "New address" : "Edit address"}</h3>
          <div style={{ display: "grid", gap: 8, maxWidth: 480 }}>
            <input placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <input placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <input placeholder="Address line 1" value={form.address_1} onChange={(e) => setForm({ ...form, address_1: e.target.value })} />
            <input placeholder="Address line 2" value={form.address_2} onChange={(e) => setForm({ ...form, address_2: e.target.value })} />
            <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <input placeholder="Postal code" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
            <input placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className={styles.addButton} onClick={save}>
                Save
              </button>
              <button type="button" className={styles.actionBtn} onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
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
                {address.city}, {address.state} {address.postal_code}
              </p>
              <p className={styles.addressLine}>{address.country}</p>
            </div>

            <div className={styles.cardActions}>
              <button type="button" className={styles.actionBtn} onClick={() => startEdit(address)}>
                <Edit2 size={16} /> Edit
              </button>
              <button type="button" className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => remove(address.id)}>
                <Trash2 size={16} /> Delete
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
