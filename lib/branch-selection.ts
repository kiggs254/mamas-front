const BRANCH_KEY = "cleanshelf_branch";
const LEGACY_KEY = "cleanshelf_location";

/** HttpOnly=false cookie so Next.js server components can scope product lists to the selected branch. */
export const BRANCH_ID_COOKIE = "cleanshelf_branch_id";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function setBranchIdCookie(id: string | null) {
  if (typeof document === "undefined") return;
  if (id && /^\d+$/.test(id.trim())) {
    const v = id.trim();
    document.cookie = `${BRANCH_ID_COOKIE}=${encodeURIComponent(v)};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
  } else {
    document.cookie = `${BRANCH_ID_COOKIE}=;path=/;max-age=0`;
  }
}

/** Keep cookie in sync with localStorage (also run on app load for older sessions). */
export function syncBranchCookieFromSelection(b: SelectedBranch | null) {
  const id = b && /^\d+$/.test(String(b.id).trim()) ? String(b.id).trim() : null;
  setBranchIdCookie(id);
}

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
  syncBranchCookieFromSelection(b);
}

export function headerLocationLabel(b: SelectedBranch | null): string {
  if (!b) return "Select Location";
  return b.name;
}
