const BRANCH_KEY = "cleanshelf_branch";
const LEGACY_KEY = "cleanshelf_location";

export type SelectedBranch = { id: string; name: string; city?: string };

export function readSelectedBranch(): SelectedBranch | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BRANCH_KEY);
    if (raw) {
      const p = JSON.parse(raw) as unknown;
      if (p && typeof p === "object" && "name" in p) {
        const o = p as Record<string, unknown>;
        const name = typeof o.name === "string" ? o.name : "";
        if (!name) return null;
        return {
          id: typeof o.id === "string" ? o.id : "",
          name,
          city: typeof o.city === "string" ? o.city : undefined,
        };
      }
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return { id: "", name: legacy };
  } catch {
    /* ignore */
  }
  return null;
}

export function writeSelectedBranch(b: SelectedBranch) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BRANCH_KEY, JSON.stringify(b));
  localStorage.removeItem(LEGACY_KEY);
}

export function headerLocationLabel(b: SelectedBranch | null): string {
  if (!b) return "Select Location";
  return b.name;
}
