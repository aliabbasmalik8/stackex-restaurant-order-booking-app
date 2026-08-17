/** Browser Maps JavaScript API key. Not the Nest Geocoding/Places key. */
export function getGoogleMapsWebKey(): string {
  return process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY?.trim() ?? '';
}

const SCRIPT_ID = 'google-maps-js';

let loading: Promise<void> | null = null;

/** Load Maps JS once. Do not add `libraries=places` — search stays on Nest. */
export function loadGoogleMapsJs(apiKey: string): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Google Maps JS is web-only'));
  }
  if (window.google?.maps?.Map) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => {
          loading = null;
          reject(new Error('Google Maps failed to load'));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.onload = () => resolve();
    script.onerror = () => {
      loading = null;
      reject(new Error('Google Maps failed to load'));
    };
    document.head.appendChild(script);
  });

  return loading;
}
