import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

const backendOrigin = process.env.BACKEND_ORIGIN || "http://127.0.0.1:4000";

// Derive the production image/media host(s) from the same env vars the app
// already uses to resolve media URLs, so we can allow-list them explicitly
// instead of using a wildcard "**" hostname.
const dynamicImageHosts: RemotePattern[] = [];
for (const raw of [
  process.env.NEXT_PUBLIC_MEDIA_ORIGIN,
  process.env.BACKEND_ORIGIN,
]) {
  if (!raw) continue;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") continue;
    dynamicImageHosts.push({
      protocol: u.protocol.replace(":", "") as "http" | "https",
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: "/**",
    });
  } catch {
    /* ignore malformed origins */
  }
}

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), microphone=(), camera=(), payment=()",
  },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  async redirects() {
    return [{ source: "/recipes", destination: "/blogs", permanent: true }];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin.replace(/\/$/, "")}/api/v1/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    dangerouslyAllowSVG: false,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cleanshelfapi.emmerce.io",
        pathname: "/**",
      },
      {
        // Shared platform object storage — product images on this S3 custom domain.
        protocol: "https",
        hostname: "storage.chatcommerce.co.ke",
        pathname: "/**",
      },
      ...dynamicImageHosts,
    ],
  },
};

export default nextConfig;
