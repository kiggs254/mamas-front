import Link from "next/link";
import { serverApiGet } from "@/lib/server-api";
import type { BrandRow } from "@/types/api";

export default async function BrandsPage() {
  const data = await serverApiGet<{ brands: BrandRow[] }>("/storefront/brands");
  const brands = data?.brands || [];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <h1>Brands</h1>
      <ul>
        {brands.map((b) => (
          <li key={b.id}>
            <Link href={b.slug ? `/shop?brand_slug=${encodeURIComponent(b.slug)}` : "/shop"} prefetch={false}>
              {b.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
