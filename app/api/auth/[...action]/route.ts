import { NextRequest, NextResponse } from "next/server";
import { getInternalApiBase } from "@/lib/api-config";

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

  const upstream = await fetch(url, {
    method: req.method,
    headers,
    body: req.method !== "GET" ? await req.text() : undefined,
  });

  const body = await upstream.text();
  const res = new NextResponse(body, {
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
