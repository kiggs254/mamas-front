import { serverApiGet } from "@/lib/server-api";

type LocatorConfig = {
  enabled?: boolean;
  stores?: { name?: string; address?: string; city?: string; phone?: string; hours?: string }[];
};

export default async function StoreLocatorPage() {
  const data = await serverApiGet<LocatorConfig>("/storefront/store-locator");

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <h1>Store locator</h1>
      {!data?.stores?.length ? (
        <p>No locations configured.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {data.stores.map((s, i) => (
            <li key={i} style={{ padding: 16, border: "1px solid #eee", borderRadius: 8, marginBottom: 12 }}>
              <strong>{s.name}</strong>
              <div>{s.address}</div>
              <div>{s.city}</div>
              {s.phone && <div>{s.phone}</div>}
              {s.hours && <div>{s.hours}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
