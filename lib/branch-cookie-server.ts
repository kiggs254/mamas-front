import { cookies } from "next/headers";

/** Must match `BRANCH_ID_COOKIE` in `@/lib/branch-selection` (client). */
export const STOREFRONT_BRANCH_COOKIE = "cleanshelf_branch_id";

/** Numeric Branch id from cookie, for server-rendered product APIs. */
export async function getStorefrontBranchIdCookie(): Promise<number | undefined> {
  const jar = await cookies();
  const raw = jar.get(STOREFRONT_BRANCH_COOKIE)?.value?.trim();
  if (!raw || !/^\d+$/.test(raw)) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}
