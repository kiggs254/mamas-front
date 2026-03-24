import useSWR from "swr";
import { swrFetcher } from "@/lib/swr";
import type { CartLine } from "@/types/api";

export type CartData = { items: CartLine[] };

export function useCart() {
  return useSWR<CartData>("/storefront/cart", () => swrFetcher<CartData>("/storefront/cart"), {
    revalidateOnFocus: true,
  });
}
