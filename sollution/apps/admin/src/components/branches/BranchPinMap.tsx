import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui'
import {
  FALLBACK_BRANCH_PIN,
  getGoogleMapsWebKey,
  loadGoogleMapsJs,
} from '@/lib/googleMapsWeb'
import { colors } from '@/theme'

const PIN_ZOOM = 15

type MapsApi = NonNullable<Window['google']>['maps']
type MapInstance = InstanceType<MapsApi['Map']>
type MarkerInstance = InstanceType<MapsApi['Marker']>
type CircleInstance = InstanceType<MapsApi['Circle']>
type MapsListener = { remove: () => void }

type Props = {
  lat: number | null
  lng: number | null
  deliveryRadiusKm: number | null
  onPinChange: (lat: number, lng: number) => void
}

function pinFrom(
  lat: number | null,
  lng: number | null,
): { lat: number; lng: number } | null {
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

export function BranchPinMap({
  lat,
  lng,
  deliveryRadiusKm,
  onPinChange,
}: Props) {
  const { t } = useTranslation()
  const hostRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapInstance | null>(null)
  const markerRef = useRef<MarkerInstance | null>(null)
  const circleRef = useRef<CircleInstance | null>(null)
  const listenersRef = useRef<MapsListener[]>([])
  const onPinChangeRef = useRef(onPinChange)
  const deliveryRadiusKmRef = useRef(deliveryRadiusKm)
  const lastEmittedRef = useRef<{ lat: number; lng: number } | null>(
    pinFrom(lat, lng),
  )
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const apiKey = getGoogleMapsWebKey()

  onPinChangeRef.current = onPinChange
  deliveryRadiusKmRef.current = deliveryRadiusKm

  useEffect(() => {
    let cancelled = false

    const emitPin = (nextLat: number, nextLng: number) => {
      lastEmittedRef.current = { lat: nextLat, lng: nextLng }
      onPinChangeRef.current(nextLat, nextLng)
    }

    const syncCircle = (center: { lat: number; lng: number }) => {
      const map = mapRef.current
      const maps = window.google?.maps
      if (!map || !maps) return
      const radiusKm = deliveryRadiusKmRef.current

      if (radiusKm == null || radiusKm <= 0) {
        circleRef.current?.setMap(null)
        circleRef.current = null
        return
      }

      const meters = radiusKm * 1000
      if (!circleRef.current) {
        circleRef.current = new maps.Circle({
          map,
          center,
          radius: meters,
          fillColor: colors.primary,
          fillOpacity: 0.12,
          strokeColor: colors.primary,
          strokeWeight: 2,
          clickable: false,
        })
        return
      }
      circleRef.current.setCenter(center)
      circleRef.current.setRadius(meters)
    }

    const ensureMarker = (position: { lat: number; lng: number }) => {
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
            const next = { lat: pos.lat(), lng: pos.lng() }
            emitPin(next.lat, next.lng)
            syncCircle(next)
          }),
        )
      } else {
        markerRef.current.setPosition(position)
      }
      syncCircle(position)
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
            emitPin(next.lat, next.lng)
          }),
        )
        const initialPin = pinFrom(lat, lng)
        if (initialPin) ensureMarker(initialPin)
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
      circleRef.current?.setMap(null)
      circleRef.current = null
      mapRef.current = null
    }
    // Parent only mounts this when the operator opens the pin editor.
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
  }, [lat, lng, ready])

  useEffect(() => {
    if (!ready) return
    const pos = markerRef.current?.getPosition()
    const map = mapRef.current
    const maps = window.google?.maps
    if (!map || !maps) return

    if (!pos || deliveryRadiusKm == null || deliveryRadiusKm <= 0) {
      circleRef.current?.setMap(null)
      circleRef.current = null
      return
    }

    const center = { lat: pos.lat(), lng: pos.lng() }
    const meters = deliveryRadiusKm * 1000
    if (!circleRef.current) {
      circleRef.current = new maps.Circle({
        map,
        center,
        radius: meters,
        fillColor: colors.primary,
        fillOpacity: 0.12,
        strokeColor: colors.primary,
        strokeWeight: 2,
        clickable: false,
      })
      return
    }
    circleRef.current.setCenter(center)
    circleRef.current.setRadius(meters)
  }, [deliveryRadiusKm, ready, lat, lng])

  if (failed) {
    return (
      <Text variant="caption" className="text-error">
        {t('branches.form.mapLoadFailed')}
      </Text>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-80 overflow-hidden rounded-xl border border-border bg-surface">
        <div ref={hostRef} className="absolute inset-0" />
        {!ready ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface">
            <Text variant="caption" className="text-muted">
              {t('common.loading')}
            </Text>
          </div>
        ) : null}
      </div>
      <Text variant="caption" className="text-muted">
        {t('branches.form.mapHint')}
      </Text>
    </div>
  )
}
