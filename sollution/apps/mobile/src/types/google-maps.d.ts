export {};

type LatLngLiteral = { lat: number; lng: number };

type GoogleMapInstance = {
  panTo: (latLng: LatLngLiteral) => void;
  setZoom: (zoom: number) => void;
  getCenter: () => { lat: () => number; lng: () => number } | undefined;
  addListener: (event: string, handler: () => void) => { remove: () => void };
};

type GoogleMapsNamespace = {
  Map: new (
    el: HTMLElement,
    opts?: {
      center: LatLngLiteral;
      zoom?: number;
      disableDefaultUI?: boolean;
      clickableIcons?: boolean;
      gestureHandling?: string;
      keyboardShortcuts?: boolean;
      zoomControl?: boolean;
      fullscreenControl?: boolean;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
    },
  ) => GoogleMapInstance;
};

declare global {
  interface Window {
    google?: { maps: GoogleMapsNamespace };
  }
}
