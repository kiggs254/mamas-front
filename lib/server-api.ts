import { cookies } from "next/headers";
import { getInternalApiBase } from "./api-config";
import type { ApiEnvelope } from "@/types/api";
import { ApiError } from "./api";

function joinPath(base: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

async function cookieHeader(): Promise<string> {
  const jar = await cookies();
  return jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

const SERVER_FETCH_TIMEOUT_MS = 10_000;

// Trusted server-side (SSR) calls carry the shared internal token so the backend
// skips its per-IP rate limiter for our aggregated server traffic — all SSR
// reaches the backend from this one server IP, so per-IP limiting collapses
// every visitor into one bucket and returns 429s. Set INTERNAL_API_TOKEN to the
// same secret on the backend and here. Server-only env, never shipped to the
// browser bundle. Unset → header omitted, behaviour unchanged.
const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN || "";

export async function serverFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = joinPath(getInternalApiBase(), path);
  const headers = new Headers(init.headers);
  const cookie = await cookieHeader();
  if (cookie) headers.set("Cookie", cookie);
  if (INTERNAL_API_TOKEN && !headers.has("X-Internal-Token")) {
    headers.set("X-Internal-Token", INTERNAL_API_TOKEN);
  }
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SERVER_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function serverApiGet<T>(path: string): Promise<T | null> {
  try {
    const res = await serverFetch(path, { method: "GET" });
    const json = (await res.json()) as ApiEnvelope<T>;
    if (!res.ok || json.status !== "success") return null;
    return json.data as T;
  } catch {
    return null;
  }
}

export async function serverApiPost<T>(path: string, body?: unknown): Promise<T | null> {
  try {
    const res = await serverFetch(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const json = (await res.json()) as ApiEnvelope<T>;
    if (!res.ok || json.status !== "success") return null;
    return json.data as T;
  } catch {
    return null;
  }
}

/** Strict POST — throws ApiError */
export async function serverApiPostOrThrow<T>(path: string, body?: unknown): Promise<T> {
  const res = await serverFetch(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json()) as ApiEnvelope<T> & { message?: string };
  if (!res.ok || json.status !== "success") {
    throw new ApiError(json.message || res.statusText, res.status, json);
  }
  return json.data as T;
}
