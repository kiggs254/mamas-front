import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import type { BrandRow } from "@/types/api";
import shell from "../styles/shell.module.css";

export default async function BrandsPage() {
  const data = await serverApiGet<{ brands: BrandRow[] }>("/storefront/brands");
  const brands = data?.brands || [];

  return (
    <div className={shell.shell}>
      <nav className={shell.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={shell.sep}>/</span>
        <span>Brands</span>
      </nav>

      <header className={shell.pageHero}>
        <p className={shell.eyebrow}>Shop by brand</p>
        <h1 className={shell.title}>Brands</h1>
        <div className={shell.titleUnderline} />
        <p className={shell.lead}>Choose a brand to see its products in the shop.</p>
      </header>

      {brands.length === 0 ? (
        <p className={shell.empty}>No brands are available yet.</p>
      ) : (
        <div className={shell.cardGrid}>
          {brands.map((b) => (
            <Link
              key={b.id}
              href={b.slug ? `/shop?brand_slug=${encodeURIComponent(b.slug)}` : "/shop"}
              className={shell.linkCard}
              prefetch={false}
            >
              <span className={shell.linkCardIcon} aria-hidden>
                🏷️
              </span>
              <div className={shell.linkCardBody}>
                <h2>{b.name}</h2>
                <p>View products</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
