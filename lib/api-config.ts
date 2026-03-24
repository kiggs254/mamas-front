/**
 * Browser: same-origin `/api/v1` (rewrites to backend) so session cookies work.
 * Server: direct backend URL with forwarded Cookie header.
 */
export function getBrowserApiBase(): string {
  const b = process.env.NEXT_PUBLIC_API_BROWSER_BASE || "/api/v1";
  return b.replace(/\/$/, "");
}

export function getInternalApiBase(): string {
  const b =
    process.env.API_INTERNAL_BASE ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:4000/api/v1";
  return b.replace(/\/$/, "");
}

/** Origin for resolving relative media URLs (e.g. /uploads/...) */
export function getMediaOrigin(): string {
  const o =
    process.env.NEXT_PUBLIC_MEDIA_ORIGIN ||
    process.env.BACKEND_ORIGIN ||
    "http://127.0.0.1:4000";
  return o.replace(/\/$/, "");
}

export function sessionCookieName(): string {
  return process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME || "shopflow.sid";
}

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${getMediaOrigin()}${url.startsWith("/") ? url : `/${url}`}`;
}
