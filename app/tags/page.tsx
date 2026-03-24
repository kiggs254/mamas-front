import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import type { TagRow } from "@/types/api";

export default async function TagsPage() {
  const data = await serverApiGet<{ tags: TagRow[] }>("/storefront/tags");
  const tags = data?.tags || [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <h1>Tags</h1>
      <ul style={{ display: "flex", flexWrap: "wrap", gap: 12, listStyle: "none", padding: 0 }}>
        {tags.map((t) => (
          <li key={t.id}>
            <Link
              href={t.slug ? `/shop?tag_slug=${encodeURIComponent(t.slug)}` : "/shop"}
              prefetch={false}
              style={{ padding: "6px 12px", border: "1px solid #ddd", borderRadius: 20, textDecoration: "none" }}
            >
              {t.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
