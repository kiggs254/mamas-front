import { serverApiGet } from "@/lib/server-api";
import type { HomepageSection } from "@/types/api";
import HomepageSectionRenderer from "./components/HomepageSectionRenderer";

/** Mirrors Admin `defaultHomepageSections` when the API is unavailable. */
const FALLBACK_SECTIONS: HomepageSection[] = [
  { id: "hero", type: "hero", enabled: true },
  {
    id: "categories",
    type: "categories",
    enabled: true,
    title: "Shop by category",
    subtitle: "Collections",
    layout: "grid",
    config: { category_ids: [], limit: 12, visible_count: 6 },
  },
  {
    id: "featured_products",
    type: "products",
    enabled: true,
    title: "Featured Products",
    subtitle: "Discover our handpicked selection of premium items",
    layout: "carousel",
    config: { source: "manual", product_ids: [], sort: "newest", limit: 6, visible_count: 6 },
  },
  { id: "brands", type: "brands", enabled: true },
  { id: "banners_middle", type: "banners_middle", enabled: true },
  {
    id: "best_sellers",
    type: "products",
    enabled: true,
    title: "Best Sellers",
    subtitle: "Our most popular products loved by customers",
    layout: "grid",
    config: { source: "best_sellers", sort: "best_sellers", limit: 6, visible_count: 6 },
  },
  {
    id: "testimonials",
    type: "testimonials",
    enabled: true,
    title: "What Our Customers Say",
    subtitle: "Real reviews from real customers",
    layout: "carousel",
    config: { source: "latest", limit: 10, visible_count: 3 },
  },
];

export default async function Home() {
  const data = await serverApiGet<{ sections: HomepageSection[] }>("/storefront/homepage-sections");
  const sections = data?.sections?.length ? data.sections : FALLBACK_SECTIONS;

  return (
    <>
      {sections.map((section) => (
        <HomepageSectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}
