const SCRIPT_ID = "cleanshelf-google-maps-js";

declare global {
  interface Window {
    gmPlacesInit?: () => void;
  }
}

function waitForPlaces(): Promise<void> {
  const w = window as Window & { google?: { maps?: { places?: unknown } } };
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (w.google?.maps?.places) {
        clearInterval(iv);
        resolve();
      } else if (Date.now() - t0 > 20000) {
        clearInterval(iv);
        reject(new Error("Google Maps failed to load"));
      }
    }, 50);
  });
}

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const w = window as Window & { google?: { maps?: { places?: unknown } } };
  if (w.google?.maps?.places) return Promise.resolve();

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return waitForPlaces();
  }

  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.defer = true;
    window.gmPlacesInit = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => reject(new Error("Could not load Google Maps"));
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&callback=gmPlacesInit`;
    document.head.appendChild(s);
  });
}
