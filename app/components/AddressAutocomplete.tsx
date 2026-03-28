"use client";

import { useEffect, useRef } from "react";
import { loadGoogleMapsScript } from "@/lib/googleMapsLoader";

type AddrComp = { long_name: string; short_name: string; types: string[] };

export type PlaceResolved = {
  address1: string;
  city: string;
  county: string;
  lat: number;
  lng: number;
};

function buildStreetLine(components: AddrComp[]): string {
  let num = "";
  let route = "";
  for (const c of components) {
    if (c.types.includes("street_number")) num = c.long_name;
    if (c.types.includes("route")) route = c.long_name;
  }
  const line = [num, route].filter(Boolean).join(" ").trim();
  if (line) return line;
  return "";
}

function localityFromComponents(components: AddrComp[]): string {
  for (const c of components) {
    if (c.types.includes("locality")) return c.long_name;
  }
  for (const c of components) {
    if (c.types.includes("administrative_area_level_2")) return c.long_name;
  }
  return "";
}

/** Map Google administrative_area / locality to one of the shop county names. */
export function matchKenyaCounty(googleName: string | undefined, countyList: readonly string[]): string | null {
  if (!googleName?.trim()) return null;
  const g = googleName.trim().toLowerCase();
  for (const county of countyList) {
    const c = county.toLowerCase();
    if (c === g || g.includes(c) || c.includes(g.replace(/\s+county$/i, "").trim())) return county;
  }
  const gNorm = g.replace(/\s+county$/i, "").replace(/\s+city$/i, "").trim();
  for (const county of countyList) {
    const cNorm = county.toLowerCase().replace(/\s+city$/i, "").replace(/\s+county$/i, "").trim();
    if (gNorm === cNorm || gNorm.includes(cNorm) || cNorm.includes(gNorm)) return county;
  }
  return null;
}

type Props = {
  apiKey: string;
  enabled: boolean;
  value: string;
  onChange: (v: string) => void;
  onPlaceResolved: (p: PlaceResolved) => void;
  countyOptions: readonly string[];
  className?: string;
  placeholder?: string;
};

export default function AddressAutocomplete({
  apiKey,
  enabled,
  value,
  onChange,
  onPlaceResolved,
  countyOptions,
  className,
  placeholder,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<unknown>(null);
  const onChangeRef = useRef(onChange);
  const onPlaceResolvedRef = useRef(onPlaceResolved);
  const countyRef = useRef(countyOptions);
  onChangeRef.current = onChange;
  onPlaceResolvedRef.current = onPlaceResolved;
  countyRef.current = countyOptions;

  useEffect(() => {
    if (!enabled || !apiKey || !inputRef.current) return;
    let cancelled = false;
    const inputEl = inputRef.current;

    (async () => {
      try {
        await loadGoogleMapsScript(apiKey);
      } catch {
        return;
      }
      if (cancelled || !inputEl) return;

      const g = window as Window & {
        google?: {
          maps?: {
            places?: {
              Autocomplete: new (el: HTMLInputElement, opts?: object) => {
                addListener: (ev: string, fn: () => void) => void;
                getPlace: () => {
                  address_components?: AddrComp[];
                  geometry?: { location?: { lat: () => number; lng: () => number } };
                  formatted_address?: string;
                };
              };
            };
            event?: { clearInstanceListeners: (o: unknown) => void };
          };
        };
      };
      const places = g.google?.maps?.places;
      if (!places?.Autocomplete) return;

      const ac = new places.Autocomplete(inputEl, {
        componentRestrictions: { country: "ke" },
        fields: ["address_components", "geometry", "formatted_address"],
      });
      acRef.current = ac;

      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        const loc = place.geometry?.location;
        if (!loc) return;
        const lat = loc.lat();
        const lng = loc.lng();
        const comps = place.address_components || [];
        const street = buildStreetLine(comps);
        const address1 = street || (place.formatted_address?.split(",")[0]?.trim() ?? "");
        const city = localityFromComponents(comps) || "";
        let admin = "";
        for (const c of comps) {
          if (c.types.includes("administrative_area_level_1")) {
            admin = c.long_name;
            break;
          }
        }
        const counties = countyRef.current;
        const county =
          matchKenyaCounty(admin, counties) || matchKenyaCounty(city, counties) || counties[0] || "Nairobi City";
        onChangeRef.current(address1);
        onPlaceResolvedRef.current({
          address1,
          city,
          county,
          lat,
          lng,
        });
      });
    })();

    return () => {
      cancelled = true;
      const g = window as Window & { google?: { maps?: { event?: { clearInstanceListeners: (o: unknown) => void } } } };
      if (acRef.current && g.google?.maps?.event) {
        g.google.maps.event.clearInstanceListeners(acRef.current);
      }
      acRef.current = null;
    };
  }, [enabled, apiKey]);

  if (!enabled) {
    return (
      <input
        ref={inputRef}
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <input
      ref={inputRef}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="street-address"
    />
  );
}
