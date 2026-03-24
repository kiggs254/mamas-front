import { apiFetch, parseJson } from "./api";
import type { ApiEnvelope } from "@/types/api";

export async function swrFetcher<T>(path: string): Promise<T> {
  const res = await apiFetch(path, { method: "GET" });
  const json = await parseJson<ApiEnvelope<T>>(res);
  if (!res.ok || json.status !== "success") {
    const msg =
      (json as { message?: string }).message ||
      (json as { error?: string }).error ||
      res.statusText;
    throw new Error(msg || "Failed to load");
  }
  return json.data as T;
}
