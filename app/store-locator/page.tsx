import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import shell from "../styles/shell.module.css";

type LocatorConfig = {
  enabled?: boolean;
  stores?: { name?: string; address?: string; city?: string; phone?: string; hours?: string }[];
};

export default async function StoreLocatorPage() {
  const data = await serverApiGet<LocatorConfig>("/storefront/store-locator");

  return (
    <div className={shell.shell}>
      <nav className={shell.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className={shell.sep}>/</span>
        <span>Store locator</span>
      </nav>

      <header className={shell.pageHero}>
        <p className={shell.eyebrow}>Visit us</p>
        <h1 className={shell.title}>Store locator</h1>
        <div className={shell.titleUnderline} />
        <p className={shell.lead}>Find a Mama's Market location, hours, and contact details.</p>
      </header>

      {!data?.stores?.length ? (
        <p className={shell.empty}>Store locations are not configured yet.</p>
      ) : (
        <ul className={shell.storeList}>
          {data.stores.map((s, i) => (
            <li key={i} className={shell.storeCard}>
              <h2 className={shell.storeName}>{s.name || "Store"}</h2>
              <div className={shell.storeMeta}>
                {s.address ? <p>{s.address}</p> : null}
                {s.city ? <p>{s.city}</p> : null}
                {s.phone ? <p>{s.phone}</p> : null}
                {s.hours ? <p>{s.hours}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
