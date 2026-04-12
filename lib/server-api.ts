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

export async function serverFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = joinPath(getInternalApiBase(), path);
  const headers = new Headers(init.headers);
  const cookie = await cookieHeader();
  if (cookie) headers.set("Cookie", cookie);
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
