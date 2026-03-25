import type { StorefrontCategory } from "@/types/api";

/** Depth-first flatten of category tree (for sidebars, menus). */
export function flattenCategoryTree(categories: StorefrontCategory[]): StorefrontCategory[] {
  const out: StorefrontCategory[] = [];
  for (const c of categories) {
    out.push(c);
    if (Array.isArray(c.children) && c.children.length > 0) {
      out.push(...flattenCategoryTree(c.children));
    }
  }
  return out;
}
