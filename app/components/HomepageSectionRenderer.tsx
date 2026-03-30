import type { HomepageSection } from "@/types/api";
import HeroBanner from "./HeroBanner";
import FeaturedCategoriesSection from "./FeaturedCategoriesSection";
import HomepageProductsBlock from "./HomepageProductsBlock";
import BrandsSection from "./BrandsSection";
import PromoBanners from "./PromoBanners";
import TestimonialsSection from "./TestimonialsSection";

export default async function HomepageSectionRenderer({ section }: { section: HomepageSection }) {
  if (section.enabled === false) return null;

  switch (section.type) {
    case "hero":
      return <HeroBanner />;
    case "categories":
      return <FeaturedCategoriesSection section={section} />;
    case "products":
      return <HomepageProductsBlock section={section} />;
    case "brands":
      return <BrandsSection title={section.title} subtitle={section.subtitle} />;
    case "banners_middle":
      return <PromoBanners />;
    case "testimonials":
      return <TestimonialsSection section={section} />;
    default:
      return null;
  }
}
