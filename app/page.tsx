import HeroBanner from "./components/HeroBanner";
import FeaturedCategories from "./components/FeaturedCategories";
import FeaturedProducts from "./components/FeaturedProducts";
import PromoBanners from "./components/PromoBanners";
import PopularProducts from "./components/PopularProducts";
import DailyBestSells from "./components/DailyBestSells";
import DealsOfDay from "./components/DealsOfDay";
import ProductLists from "./components/ProductLists";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <FeaturedCategories />
      <FeaturedProducts />
      <PromoBanners />
      <PopularProducts />
      <DailyBestSells />
      <DealsOfDay />
      <ProductLists />
    </>
  );
}
