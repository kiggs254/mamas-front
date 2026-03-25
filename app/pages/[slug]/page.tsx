import Link from "next/link";
import { notFound } from "next/navigation";
import { serverApiGet } from "@/lib/server-api";
import type { StorePage } from "@/types/api";
import styles from "./page.module.css";

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await serverApiGet<{ page: StorePage }>(`/storefront/pages/${encodeURIComponent(slug)}`);
  if (!data?.page) notFound();
  const page = data.page;

  return (
    <div className={styles.shell}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={styles.sep}>/</span>
        <span>{page.title}</span>
      </nav>

      <article className={styles.article}>
        <h1 className={styles.title}>{page.title}</h1>
        <div className={styles.titleUnderline} />
        <div className={styles.content} dangerouslySetInnerHTML={{ __html: page.content || "" }} />
      </article>
    </div>
  );
}
