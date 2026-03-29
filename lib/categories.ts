import type { StorefrontCategory } from "@/types/api";

function sortCategoryNodes(nodes: StorefrontCategory[]): StorefrontCategory[] {
  return [...nodes]
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
    .map((c) => ({
      ...c,
      children:
        Array.isArray(c.children) && c.children.length > 0 ? sortCategoryNodes(c.children) : undefined,
    }));
}

/**
 * Ensures a proper tree: storefront may return nested roots, or a flat list with parent_id.
 */
export function normalizeStorefrontCategoryTree(categories: StorefrontCategory[]): StorefrontCategory[] {
  if (!categories.length) return [];

  const hasNestedChildren = categories.some((c) => Array.isArray(c.children) && c.children.length > 0);
  const hasNonRootEntries = categories.some((c) => (c.parent_id ?? null) !== null);

  if (hasNonRootEntries) {
    const map = new Map<number, StorefrontCategory & { children: StorefrontCategory[] }>();
    for (const c of categories) {
      map.set(c.id, { ...c, children: [] });
    }
    const roots: StorefrontCategory[] = [];
    for (const c of categories) {
      const node = map.get(c.id)!;
      const pid = c.parent_id ?? null;
      if (pid != null && map.has(pid)) {
        map.get(pid)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return sortCategoryNodes(roots);
  }

  return sortCategoryNodes(categories);
}

type SlugTreeNode = { id: number; slug?: string; children?: SlugTreeNode[] };

/** IDs of categories that must be expanded to reveal the node with `slug` (ancestors only). */
export function categoryAncestorIdsForSlug(nodes: SlugTreeNode[], slug: string | undefined): Set<number> {
  const ids = new Set<number>();
  if (!slug?.trim()) return ids;

  const walk = (list: SlugTreeNode[]): boolean => {
    for (const n of list) {
      if (n.slug === slug) return true;
      const ch = n.children;
      if (ch?.length && walk(ch)) {
        ids.add(n.id);
        return true;
      }
    }
    return false;
  };

  walk(nodes);
  return ids;
}

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
