import { notFound } from "next/navigation";
import { serverApiGet } from "@/lib/server-api";
import { getCustomer } from "@/lib/auth";
import type { Review, StorefrontProduct } from "@/types/api";
import ProductDetailView from "./ProductDetailView";
import PopularProducts from "../../components/PopularProducts";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const slug = decodeURIComponent(id);

  const data = await serverApiGet<{ product: StorefrontProduct }>(
    `/storefront/products/${encodeURIComponent(slug)}`
  );
  if (!data?.product) notFound();

  const product = data.product;
  const [reviewsData, customer] = await Promise.all([
    serverApiGet<{ reviews: Review[] }>(`/storefront/reviews?product_id=${product.id}&limit=50`),
    getCustomer(),
  ]);

  const wishlistData = customer
    ? await serverApiGet<{ items: { product_id: number }[] }>("/storefront/wishlist")
    : null;

  const initialReviews = reviewsData?.reviews || product.reviews || [];
  const inWl = Boolean(wishlistData?.items?.some((i) => i.product_id === product.id));

  return (
    <>
      <ProductDetailView product={product} initialReviews={initialReviews} wishlistInitially={inWl} />
      <PopularProducts />
    </>
  );
}
