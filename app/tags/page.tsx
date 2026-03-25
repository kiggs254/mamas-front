import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import type { TagRow } from "@/types/api";
import shell from "../styles/shell.module.css";

export default async function TagsPage() {
  const data = await serverApiGet<{ tags: TagRow[] }>("/storefront/tags");
  const tags = data?.tags || [];

  return (
    <div className={shell.shell}>
      <nav className={shell.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={shell.sep}>/</span>
        <span>Tags</span>
      </nav>

      <header className={shell.pageHero}>
        <p className={shell.eyebrow}>Discover</p>
        <h1 className={shell.title}>Product tags</h1>
        <div className={shell.titleUnderline} />
        <p className={shell.lead}>Tap a tag to filter the shop by theme, diet, or product type.</p>
      </header>

      {tags.length === 0 ? (
        <p className={shell.empty}>No tags are configured yet.</p>
      ) : (
        <div className={shell.panel}>
          <div className={shell.tagCloud}>
          {tags.map((t) => (
            <Link
              key={t.id}
              href={t.slug ? `/shop?tag_slug=${encodeURIComponent(t.slug)}` : "/shop"}
              className={shell.tagPill}
              prefetch={false}
            >
              {t.name}
            </Link>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
