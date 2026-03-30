const FALLBACK_TZ = "Africa/Nairobi";

/** Format an ISO date in the shop timezone (from storefront settings). */
export function formatShopDate(
  iso: string | Date | undefined | null,
  timeZone?: string | null,
  options?: { month?: "short" | "long" }
): string {
  if (iso == null || iso === "") return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  const tz = (timeZone && timeZone.trim()) || FALLBACK_TZ;
  const month = options?.month === "long" ? "long" : "short";
  try {
    return d.toLocaleDateString("en-KE", {
      timeZone: tz,
      day: "numeric",
      month,
      year: "numeric",
    });
  } catch {
    return d.toLocaleDateString("en-KE", {
      day: "numeric",
      month,
      year: "numeric",
    });
  }
}
