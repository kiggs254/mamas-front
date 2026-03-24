import { cookies } from "next/headers";
import { sessionCookieName } from "./api-config";
import { serverApiGet } from "./server-api";
import type { Customer } from "@/types/api";

export async function hasSessionCookie(): Promise<boolean> {
  const jar = await cookies();
  return Boolean(jar.get(sessionCookieName())?.value);
}

export async function getCustomer(): Promise<Customer | null> {
  const data = await serverApiGet<{ customer: Customer | null }>("/storefront/auth/me");
  return data?.customer ?? null;
}
