"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SearchIcon } from "./Icons";
import styles from "./LiveSearch.module.css";

type Result = {
  id: number;
  name: string;
  slug?: string;
  price: string | number;
  sale_price?: string | number | null;
  images?: { url?: string }[];
  category?: { name: string } | null;
};

type Props = {
  variant?: "hero" | "header";
  categories?: { id: number; name: string; slug?: string }[];
};

function productHref(p: Result) {
  return `/product/${encodeURIComponent(p.slug || String(p.id))}`;
}

function productPrice(p: Result) {
  const base = Number(p.price) || 0;
  const sale = p.sale_price != null ? Number(p.sale_price) : null;
  return sale && sale > 0 && sale < base ? sale : base;
}

function productImage(p: Result) {
  const img = p.images?.[0];
  return (img as { url?: string; image_url?: string })?.url ||
    (img as { image_url?: string })?.image_url || "";
}

export default function LiveSearch({ variant = "header", categories = [] }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string, catSlug: string) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: q.trim(), limit: "6" });
      if (catSlug) params.set("category_slug", catSlug);
      const res = await fetch(`/api/v1/storefront/products?${params}`);
      const json = await res.json();
      const items: Result[] = json?.data?.products || [];
      setResults(items);
      setOpen(items.length > 0);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val, categorySlug), 280);
  };

  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    if (query.trim().length >= 2) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(query, slug), 280);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (categorySlug) params.set("category_slug", categorySlug);
    router.push(params.toString() ? `/shop?${params}` : "/shop");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isHero = variant === "hero";

  return (
    <div ref={wrapRef} className={`${styles.wrap} ${isHero ? styles.hero : styles.header}`}>
      <form className={styles.form} onSubmit={handleSubmit}>
        {categories.length > 0 && (
          <select
            className={styles.select}
            value={categorySlug}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug || ""} disabled={!c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          className={styles.input}
          placeholder="Search for items..."
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        <button type="submit" className={styles.btn} aria-label="Search">
          {isHero ? (
            <>Search <SearchIcon size={16} color="white" /></>
          ) : (
            <SearchIcon size={18} color="white" />
          )}
        </button>
      </form>

      {open && (
        <div className={styles.dropdown}>
          {loading && <div className={styles.loading}>Searching…</div>}
          {!loading && results.map((p) => {
            const img = productImage(p);
            const href = productHref(p);
            return (
              <Link
                key={p.id}
                href={href}
                className={styles.item}
                onClick={() => setOpen(false)}
                prefetch={false}
              >
                <span className={styles.thumb}>
                  {img ? (
                    <Image src={img} alt="" width={40} height={40} style={{ objectFit: "contain" }} />
                  ) : (
                    <span className={styles.thumbPlaceholder}>📦</span>
                  )}
                </span>
                <span className={styles.info}>
                  <span className={styles.name}>{p.name}</span>
                  {p.category?.name && <span className={styles.cat}>{p.category.name}</span>}
                </span>
                <span className={styles.price}>KES {productPrice(p).toFixed(2)}</span>
              </Link>
            );
          })}
          {!loading && results.length > 0 && (
            <button
              type="button"
              className={styles.viewAll}
              onClick={() => {
                setOpen(false);
                const params = new URLSearchParams();
                if (query.trim()) params.set("q", query.trim());
                router.push(`/shop?${params}`);
              }}
            >
              View all results for &ldquo;{query}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
