import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormError, Text } from '@/components/ui'
import { AddressPlaceSearch } from '@/components/layout/AddressPlaceSearch'
import {
  FALLBACK_BRANCH_PIN,
  getGoogleMapsWebKey,
  loadGoogleMapsJs,
} from '@/lib/googleMapsWeb'

const PIN_ZOOM = 16

type MapsApi = NonNullable<Window['google']>['maps']
type MapInstance = InstanceType<MapsApi['Map']>
type MarkerInstance = InstanceType<MapsApi['Marker']>
type MapsListener = { remove: () => void }

type Pin = { lat: number; lng: number }

type Props = {
  lat: number | null
  lng: number | null
  compact?: boolean
  onPinChange: (lat: number, lng: number) => void
  onPlacePicked?: (result: {
    lat: number
    lng: number
    line1: string
    line2: string
    area: string
    city: string
    formattedAddress: string
  }) => void
}

function pinFrom(lat: number | null, lng: number | null): Pin | null {
  if (
    typeof lat !== 'number' ||
    !Number.isFinite(lat) ||
    typeof lng !== 'number' ||
    !Number.isFinite(lng)
  ) {
    return null
  }
  return { lat, lng }
}

function samePin(a: number, b: number) {
  return Math.abs(a - b) < 1e-7
}

function getCurrentPin(): Promise<
  { ok: true; pin: Pin } | { ok: false; reason: 'denied' | 'unavailable' }
> {
  if (!navigator.geolocation) {
    return Promise.resolve({ ok: false, reason: 'unavailable' })
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          ok: true,
          pin: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        }),
      (error) =>
        resolve({
          ok: false,
          reason: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable',
        }),
      { enableHighAccuracy: false, timeout: 12_000, maximumAge: 30_000 },
    )
  })
}

export function AddressPinMap({
  lat,
  lng,
  compact = false,
  onPinChange,
  onPlacePicked,
}: Props) {
  const { t } = useTranslation()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapInstance | null>(null)
  const markerRef = useRef<MarkerInstance | null>(null)
  const listenersRef = useRef<MapsListener[]>([])
  const onPinChangeRef = useRef(onPinChange)
  const lastEmittedRef = useRef<Pin | null>(pinFrom(lat, lng))
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [locating, setLocating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const apiKey = getGoogleMapsWebKey()

  onPinChangeRef.current = onPinChange

  useEffect(() => {
    if (!apiKey) return
    let cancelled = false

    const emitPin = (next: Pin) => {
      lastEmittedRef.current = next
      onPinChangeRef.current(next.lat, next.lng)
    }

    const ensureMarker = (position: Pin) => {
      const map = mapRef.current
      const maps = window.google?.maps
      if (!map || !maps) return

      if (!markerRef.current) {
        markerRef.current = new maps.Marker({
          position,
          map,
          draggable: true,
        })
        listenersRef.current.push(
          markerRef.current.addListener('dragend', () => {
            const pos = markerRef.current?.getPosition()
            if (!pos) return
            emitPin({ lat: pos.lat(), lng: pos.lng() })
          }),
        )
      } else {
        markerRef.current.setPosition(position)
      }
    }

    void (async () => {
      try {
        await loadGoogleMapsJs(apiKey)
        if (cancelled || !hostRef.current || !window.google?.maps?.Map) {
          throw new Error('Google Maps JS missing')
        }
        const maps = window.google.maps
        const start = pinFrom(lat, lng) ?? { ...FALLBACK_BRANCH_PIN }
        const map = new maps.Map(hostRef.current, {
          center: start,
          zoom: PIN_ZOOM,
          disableDefaultUI: true,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: 'greedy',
          keyboardShortcuts: false,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
        })
        mapRef.current = map
        listenersRef.current.push(
          map.addListener('click', (e) => {
            const pos = e?.latLng
            if (!pos) return
            const next = { lat: pos.lat(), lng: pos.lng() }
            ensureMarker(next)
            emitPin(next)
          }),
        )
        ensureMarker(start)
        emitPin(start)
        if (!cancelled) setReady(true)
      } catch {
        if (!cancelled) setFailed(true)
      }
    })()

    return () => {
      cancelled = true
      for (const listener of listenersRef.current) listener.remove()
      listenersRef.current = []
      markerRef.current?.setMap(null)
      markerRef.current = null
      mapRef.current = null
    }
    // Parent remounts after search with a new initial pin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  useEffect(() => {
    if (!ready || !mapRef.current || !window.google?.maps) return
    const next = pinFrom(lat, lng)
    if (!next) return
    const last = lastEmittedRef.current
    if (last && samePin(last.lat, next.lat) && samePin(last.lng, next.lng)) {
      return
    }
    lastEmittedRef.current = next
    const map = mapRef.current
    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: next,
        map,
        draggable: true,
      })
      listenersRef.current.push(
        markerRef.current.addListener('dragend', () => {
          const pos = markerRef.current?.getPosition()
          if (!pos) return
          lastEmittedRef.current = { lat: pos.lat(), lng: pos.lng() }
          onPinChangeRef.current(pos.lat(), pos.lng())
        }),
      )
    } else {
      markerRef.current.setPosition(next)
    }
    map.panTo(next)
    map.setZoom(PIN_ZOOM)
  }, [lat, lng, ready])

  const goToMyLocation = async () => {
    if (locating) return
    setLocating(true)
    setErrorMessage(null)
    try {
      const result = await getCurrentPin()
      if (!result.ok) {
        setErrorMessage(
          t(
            result.reason === 'denied'
              ? 'menu.locationDenied'
              : 'menu.locationUnavailable',
          ),
        )
        return
      }
      onPinChange(result.pin.lat, result.pin.lng)
    } finally {
      setLocating(false)
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <AddressPlaceSearch
        biasLat={lat}
        biasLng={lng}
        onPicked={(result) => {
          onPinChange(result.lat, result.lng)
          onPlacePicked?.(result)
        }}
      />

      {!apiKey ? (
        <Text variant="caption" className="text-muted">
          {t('menu.mapUnavailable')}
        </Text>
      ) : failed ? (
        <Text variant="caption" className="text-error">
          {t('menu.mapLoadFailed')}
        </Text>
      ) : (
        <div
          className={[
            'relative overflow-hidden rounded-[20px] border border-border bg-surface',
            compact ? 'h-52' : 'h-80',
          ].join(' ')}
        >
          <div ref={hostRef} className="absolute inset-0" />
          {!ready ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface">
              <Text variant="caption" className="text-muted">
                {t('common.loading')}
              </Text>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => void goToMyLocation()}
            disabled={locating}
            className="absolute inset-x-3 bottom-3 flex h-12 items-center justify-center gap-2 rounded-pill bg-card text-[14px] font-extrabold shadow-card disabled:opacity-70"
          >
            {t('menu.useMyLocation')}
          </button>
        </div>
      )}

      <FormError message={errorMessage} />
      {apiKey && !failed ? (
        <Text variant="caption" className="text-muted">
          {t('menu.mapHint')}
        </Text>
      ) : null}
    </div>
  )
}
