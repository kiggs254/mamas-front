import { serverApiGet } from "@/lib/server-api";

export default async function FaqsPage() {
  const data = await serverApiGet<{ faqs: { question: string; answer: string }[] }>("/storefront/faqs");
  const faqs = data?.faqs || [];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      <h1>FAQs</h1>
      {faqs.length === 0 ? (
        <p>No FAQs configured.</p>
      ) : (
        <dl>
          {faqs.map((f, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <dt style={{ fontWeight: 700 }}>{f.question}</dt>
              <dd style={{ margin: "8px 0 0 0" }}>{f.answer}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
