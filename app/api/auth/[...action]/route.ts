import { NextRequest, NextResponse } from "next/server";
import { getInternalApiBase } from "@/lib/api-config";

const PROXY_TIMEOUT_MS = 10_000;

/**
 * Proxy storefront auth requests to the backend and forward Set-Cookie headers.
 * Next.js rewrites don't reliably pass Set-Cookie from upstream responses,
 * so auth endpoints go through this route handler instead.
 */
async function proxy(req: NextRequest, action: string) {
  const base = getInternalApiBase();
  const url = `${base}/storefront/auth/${action}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const cookie = req.headers.get("cookie");
  if (cookie) headers["Cookie"] = cookie;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: req.method,
      headers,
      body: req.method !== "GET" ? await req.text() : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    const message = err instanceof Error && err.name === "AbortError"
      ? "Request timed out"
      : "Unable to reach the server";
    return NextResponse.json({ status: "error", message }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }

  const body = await upstream.text();

  // Ensure the response is valid JSON — the backend might return HTML/plain text on errors
  let jsonBody: string;
  try {
    JSON.parse(body);
    jsonBody = body;
  } catch {
    jsonBody = JSON.stringify({
      status: "error",
      message: body.slice(0, 200) || "Unexpected server response",
    });
  }

  const res = new NextResponse(jsonBody, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });

  // Forward ALL Set-Cookie headers from the backend
  const setCookies = upstream.headers.getSetCookie?.() ?? [];
  for (const sc of setCookies) {
    res.headers.append("Set-Cookie", sc);
  }

  return res;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
  const { action } = await params;
  return proxy(req, action.join("/"));
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ action: string[] }> }) {
  const { action } = await params;
  return proxy(req, action.join("/"));
}
