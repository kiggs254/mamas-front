import { getInternalApiBase, getSiteUrl } from "@/lib/api-config";
import { normalizeStorefrontCategoryTree, flattenCategoryTree } from "@/lib/categories";
import type { ApiEnvelope, StorefrontCategory } from "@/types/api";

// Cache the generated file and revalidate hourly. The categories fetch below
// intentionally avoids cookies()/serverFetch so this route stays statically
// cacheable (crawlers have no session anyway).
export const revalidate = 3600;

const STORE_NAME = "Mama's Market";
const STORE_TAGLINE =
  "Authentic world flavours in Vaasa — fresh produce, international groceries, and everyday essentials, located at Vaasanpuistikko 20, Vaasa.";

const KEY_PAGES: Array<{ label: string; path: string }> = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Brands", path: "/brands" },
  { label: "Tags", path: "/tags" },
  { label: "Blogs", path: "/blogs" },
  { label: "Store locator", path: "/store-locator" },
  { label: "FAQs", path: "/faqs" },
];

async function fetchCategories(): Promise<StorefrontCategory[]> {
  try {
    const res = await fetch(`${getInternalApiBase()}/storefront/categories`, {
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as ApiEnvelope<{ categories: StorefrontCategory[] }>;
    if (json.status !== "success") return [];
    return json.data?.categories || [];
  } catch {
    return [];
  }
}

export async function GET(): Promise<Response> {
  const base = getSiteUrl();
  const rawCategories = await fetchCategories();
  const categories = flattenCategoryTree(normalizeStorefrontCategoryTree(rawCategories))
    .filter((c) => c.slug)
    .slice(0, 20);

  const lines: string[] = [
    `# ${STORE_NAME}`,
    "",
    `> ${STORE_TAGLINE}`,
    "",
    `Site: ${base}`,
    "",
    "## Key pages",
    "",
    ...KEY_PAGES.map((p) => `- [${p.label}](${base}${p.path})`),
  ];

  if (categories.length > 0) {
    lines.push("", "## Product categories", "");
    for (const c of categories) {
      lines.push(`- [${c.name}](${base}/shop?category_slug=${encodeURIComponent(c.slug!)})`);
    }
  }

  lines.push("");

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
