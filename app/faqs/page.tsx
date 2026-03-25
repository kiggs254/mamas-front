import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import shell from "../styles/shell.module.css";

export default async function FaqsPage() {
  const data = await serverApiGet<{ faqs: { question: string; answer: string }[] }>("/storefront/faqs");
  const faqs = data?.faqs || [];

  return (
    <div className={shell.shellNarrow}>
      <nav className={shell.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={shell.sep}>/</span>
        <span>FAQs</span>
      </nav>

      <header className={shell.pageHero}>
        <p className={shell.eyebrow}>Help</p>
        <h1 className={shell.title}>Frequently asked questions</h1>
        <div className={shell.titleUnderline} />
        <p className={shell.lead}>Quick answers about ordering, delivery, and your account.</p>
      </header>

      {faqs.length === 0 ? (
        <p className={shell.empty}>No FAQs have been added yet. Check back soon.</p>
      ) : (
        <div className={shell.faqList}>
          {faqs.map((f, i) => (
            <details key={i} className={shell.faqItem}>
              <summary>{f.question}</summary>
              <p className={shell.faqAnswer}>{f.answer}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
