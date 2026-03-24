"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { StorefrontCategory } from "@/types/api";
import { SearchIcon } from "./Icons";
import styles from "./Header.module.css";

type Props = {
  categories: StorefrontCategory[];
};

export default function HeaderSearch({ categories }: Props) {
  const router = useRouter();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") || "").trim();
    const category_slug = String(fd.get("category_slug") || "").trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category_slug) params.set("category_slug", category_slug);
    router.push(params.toString() ? `/shop?${params}` : "/shop");
  };

  return (
    <form className={styles.searchBar} onSubmit={onSubmit}>
      <select className={styles.searchCategory} name="category_slug" defaultValue="">
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug || ""} disabled={!c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <input type="text" name="q" className={styles.searchInput} placeholder="Search for items..." />
      <button type="submit" className={styles.searchBtn}>
        <SearchIcon size={18} color="white" />
      </button>
    </form>
  );
}
