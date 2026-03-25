"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./LocationPicker.module.css";
import { SearchIcon } from "./Icons";
import { apiGet } from "@/lib/api";
import type { StoreLocatorBranch, StoreLocatorConfig } from "@/types/api";
import { readSelectedBranch, writeSelectedBranch } from "@/lib/branch-selection";

function matchesSearch(store: StoreLocatorBranch, q: string): boolean {
  if (!q.trim()) return true;
  const n = q.toLowerCase();
  return (
    store.name.toLowerCase().includes(n) ||
    store.city.toLowerCase().includes(n) ||
    store.address.toLowerCase().includes(n)
  );
}

export default function LocationPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState<StoreLocatorBranch[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const openModal = () => setIsOpen(true);
    window.addEventListener("openLocationPicker", openModal);

    (async () => {
      try {
        const config = await apiGet<StoreLocatorConfig>("/storefront/store-locator");
        if (cancelled) return;
        setStores(config.stores ?? []);
        setFetchError(null);
      } catch (e) {
        if (cancelled) return;
        setStores([]);
        setFetchError(e instanceof Error ? e.message : "Could not load branches");
      }
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("openLocationPicker", openModal);
    };
  }, []);

  useEffect(() => {
    if (stores === null) return;
    if (stores.length === 0) return;
    if (readSelectedBranch()) return;
    const t = window.setTimeout(() => setIsOpen(true), 500);
    return () => window.clearTimeout(t);
  }, [stores]);

  const handleSelect = (store: StoreLocatorBranch) => {
    writeSelectedBranch({ id: store.id, name: store.name, city: store.city });
    setIsOpen(false);
    window.dispatchEvent(new Event("locationChange"));
  };

  const filteredStores =
    stores === null ? [] : stores.filter((s) => matchesSearch(s, search));

  if (!isOpen) return null;

  const loading = stores === null;
  const empty = !loading && stores.length === 0;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-picker-title"
      onClick={() => setIsOpen(false)}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 id="location-picker-title" className={styles.title}>
            Choose a store close to you
          </h2>
          <p className={styles.subtitle}>Select a branch from your area.</p>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "var(--color-text)", fontSize: 15 }}>
            Loading branches…
          </p>
        ) : fetchError ? (
          <p style={{ textAlign: "center", color: "var(--color-text)", fontSize: 15 }}>
            {fetchError}
          </p>
        ) : empty ? (
          <p style={{ textAlign: "center", color: "var(--color-text)", fontSize: 15 }}>
            No branches are configured yet.{" "}
            <Link href="/store-locator" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              Store locator
            </Link>
          </p>
        ) : (
          <>
            <div className={styles.searchWrap}>
              <span className={styles.searchIcon}>
                <SearchIcon size={20} />
              </span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by name, city, or address…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className={styles.listHeader}>Select a location</div>

            <div className={styles.locationsList}>
              {filteredStores.map((store) => (
                <div key={store.id} className={styles.locationItem}>
                  <div style={{ minWidth: 0, paddingRight: 12 }}>
                    <span className={styles.locationName}>{store.name}</span>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--color-text-light)",
                        marginTop: 4,
                        lineHeight: 1.35,
                      }}
                    >
                      {[store.address, store.city].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.selectBtn}
                    onClick={() => handleSelect(store)}
                  >
                    Select
                  </button>
                </div>
              ))}
              {filteredStores.length === 0 && (
                <div
                  style={{
                    color: "var(--color-text)",
                    fontSize: 14,
                    textAlign: "center",
                    marginTop: 20,
                  }}
                >
                  No stores match &quot;{search}&quot;
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
