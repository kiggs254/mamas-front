import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import shell from "../styles/shell.module.css";

type BlogRow = {
  title?: string;
  name?: string;
  description?: string;
  body?: string;
  content?: string;
};

export default async function BlogsPage() {
  const data = await serverApiGet<{ blogs: BlogRow[] }>("/storefront/blogs");
  const blogs = data?.blogs || [];

  return (
    <div className={shell.shell}>
      <nav className={shell.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={shell.sep}>/</span>
        <span>Blog</span>
      </nav>

      <header className={shell.pageHero}>
        <p className={shell.eyebrow}>From the blog</p>
        <h1 className={shell.title}>Blog</h1>
        <div className={shell.titleUnderline} />
        <p className={shell.lead}>Ideas and inspiration using ingredients you can find in our shop.</p>
      </header>

      {blogs.length === 0 ? (
        <p className={shell.empty}>No posts have been published yet.</p>
      ) : (
        <div>
          {blogs.map((r, i) => {
            const title = r.title || r.name || `Post ${i + 1}`;
            const text = r.description || "";
            const html = r.body || r.content;
            return (
              <article key={i} className={shell.blogCard}>
                <h3>{title}</h3>
                {text ? <p className={shell.blogDesc}>{text}</p> : null}
                {html ? (
                  <div className={`${shell.prose} ${shell.blogBody}`} dangerouslySetInnerHTML={{ __html: html }} />
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
