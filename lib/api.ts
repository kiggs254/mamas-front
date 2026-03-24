import { getBrowserApiBase } from "./api-config";
import type { ApiEnvelope } from "@/types/api";

export class ApiError extends Error {
  statusCode: number;
  body?: unknown;
  constructor(message: string, statusCode: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.body = body;
  }
}

function joinPath(base: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = joinPath(getBrowserApiBase(), path);
  const headers = new Headers(init.headers);
  if (init.body && typeof init.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });
}

export async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError("Invalid JSON response", res.status);
  }
}

export async function apiRequest<TData>(
  path: string,
  init: RequestInit = {}
): Promise<{ res: Response; json: ApiEnvelope<TData> }> {
  const res = await apiFetch(path, init);
  const json = await parseJson<ApiEnvelope<TData>>(res);
  return { res, json };
}

/** Expect `{ status: 'success', data: T }` */
export async function apiGet<T>(path: string): Promise<T> {
  const { res, json } = await apiRequest<T>(path, { method: "GET" });
  if (!res.ok || json.status !== "success") {
    const msg =
      (json as { message?: string }).message ||
      (json as { error?: string }).error ||
      res.statusText;
    throw new ApiError(msg || "Request failed", res.status, json);
  }
  return json.data as T;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const { res, json } = await apiRequest<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok || json.status !== "success") {
    const msg =
      (json as { message?: string }).message ||
      (json as { error?: string }).error ||
      res.statusText;
    throw new ApiError(msg || "Request failed", res.status, json);
  }
  return json.data as T;
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const { res, json } = await apiRequest<T>(path, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok || json.status !== "success") {
    const msg =
      (json as { message?: string }).message ||
      (json as { error?: string }).error ||
      res.statusText;
    throw new ApiError(msg || "Request failed", res.status, json);
  }
  return json.data as T;
}

export async function apiDelete<T = void>(path: string): Promise<T | void> {
  const { res, json } = await apiRequest<T>(path, { method: "DELETE" });
  if (!res.ok) {
    const msg =
      (json as { message?: string }).message ||
      (json as { error?: string }).error ||
      res.statusText;
    throw new ApiError(msg || "Request failed", res.status, json);
  }
  if (json && json.status === "success" && json.data !== undefined) {
    return json.data as T;
  }
}
