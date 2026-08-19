export {}

type LatLngLiteral = { lat: number; lng: number }

type MapsLatLng = { lat: () => number; lng: () => number }

type MapsMouseEvent = { latLng?: MapsLatLng }

type MapsListener = { remove: () => void }

type GoogleMapInstance = {
  panTo: (latLng: LatLngLiteral) => void
  setZoom: (zoom: number) => void
  addListener: (
    event: string,
    handler: (e?: MapsMouseEvent) => void,
  ) => MapsListener
}

type GoogleMapsMarker = {
  setPosition: (latLng: LatLngLiteral) => void
  getPosition: () => MapsLatLng | undefined
  addListener: (event: string, handler: () => void) => MapsListener
  setMap: (map: GoogleMapInstance | null) => void
}

type GoogleMapsNamespace = {
  Map: new (
    el: HTMLElement,
    opts?: {
      center: LatLngLiteral
      zoom?: number
      disableDefaultUI?: boolean
      clickableIcons?: boolean
      gestureHandling?: string
      keyboardShortcuts?: boolean
      zoomControl?: boolean
      fullscreenControl?: boolean
      mapTypeControl?: boolean
      streetViewControl?: boolean
    },
  ) => GoogleMapInstance
  Marker: new (opts: {
    position: LatLngLiteral
    map?: GoogleMapInstance
    draggable?: boolean
  }) => GoogleMapsMarker
}

declare global {
  interface Window {
    google?: { maps: GoogleMapsNamespace }
  }
}
