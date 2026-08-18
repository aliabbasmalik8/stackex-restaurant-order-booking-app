import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  usePlaceAutocomplete,
  usePlaceDetails,
  type PlacePrediction,
  type ReverseGeocodeResult,
} from '@/api/OrderBooking/modules/addresses'
import { FormError } from '@/components/ui'
import { getErrorMessage } from '@/lib/errors'

const DEBOUNCE_MS = 320

function newSessionToken(): string {
  const random =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
  return random.slice(0, 64)
}

export function AddressPlaceSearch({
  biasLat,
  biasLng,
  autoFocus = false,
  onPicked,
}: {
  biasLat?: number | null
  biasLng?: number | null
  autoFocus?: boolean
  onPicked: (result: ReverseGeocodeResult) => void
}) {
  const { t } = useTranslation()
  const autocomplete = usePlaceAutocomplete()
  const details = usePlaceDetails()
  const [query, setQuery] = useState('')
  const [predictions, setPredictions] = useState<PlacePrediction[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const sessionTokenRef = useRef(newSessionToken())
  const requestIdRef = useRef(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const biasRef = useRef({ lat: biasLat, lng: biasLng })
  const autocompleteMutateRef = useRef(autocomplete.mutateAsync)
  biasRef.current = { lat: biasLat, lng: biasLng }
  autocompleteMutateRef.current = autocomplete.mutateAsync

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setPredictions([])
      setErrorMessage(null)
      return
    }

    const handle = setTimeout(() => {
      const requestId = ++requestIdRef.current
      const { lat, lng } = biasRef.current
      void (async () => {
        try {
          const rows = await autocompleteMutateRef.current({
            query: trimmed,
            ...(typeof lat === 'number' && typeof lng === 'number'
              ? { lat, lng }
              : {}),
            sessionToken: sessionTokenRef.current,
          })
          if (requestId !== requestIdRef.current) return
          setPredictions(rows.slice(0, 8))
          setErrorMessage(null)
          setOpen(true)
        } catch (error) {
          if (requestId !== requestIdRef.current) return
          setPredictions([])
          setErrorMessage(
            getErrorMessage(error, t('menu.addressSearchFailed')),
          )
          setOpen(true)
        }
      })()
    }, DEBOUNCE_MS)

    return () => clearTimeout(handle)
  }, [query, t])

  const pickPlace = async (place: PlacePrediction) => {
    setErrorMessage(null)
    try {
      const result = await details.mutateAsync({
        placeId: place.placeId,
        sessionToken: sessionTokenRef.current,
      })
      sessionTokenRef.current = newSessionToken()
      setQuery(place.mainText)
      setPredictions([])
      setOpen(false)
      onPicked(result)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t('menu.addressSearchFailed')))
    }
  }

  const busy = details.isPending
  const trimmed = query.trim()
  const searching = autocomplete.isPending && trimmed.length >= 2
  const showMenu = open && (predictions.length > 0 || searching || Boolean(errorMessage) || (trimmed.length >= 2 && !searching))

  return (
    <div className="relative">
      <label className="flex h-11 items-center gap-2.5 rounded-pill border-[1.5px] border-border bg-surface px-4">
        <span aria-hidden>⌕</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => {
            if (predictions.length > 0 || trimmed.length >= 2) setOpen(true)
          }}
          disabled={busy}
          placeholder={t('menu.addressSearchPlaceholder')}
          className="h-full w-full bg-transparent text-[14px] font-semibold text-ink outline-none placeholder:text-muted"
        />
      </label>

      {showMenu ? (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-40 max-h-64 overflow-y-auto rounded-[16px] border border-border bg-card py-1.5 shadow-card-hover">
          {errorMessage ? (
            <p className="px-3 py-2 text-[12.5px] font-semibold text-error">
              {errorMessage}
            </p>
          ) : null}
          {searching ? (
            <p className="px-3 py-2 text-[13px] font-semibold text-sub">
              {t('common.loading')}
            </p>
          ) : null}
          {predictions.map((place) => (
            <button
              key={place.placeId}
              type="button"
              disabled={busy}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => void pickPlace(place)}
              className="flex w-full items-start gap-2.5 px-3 py-2 text-start hover:bg-surface disabled:opacity-55"
            >
              <span aria-hidden>📍</span>
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-extrabold">
                  {place.mainText}
                </span>
                {place.secondaryText ? (
                  <span className="block truncate text-[12px] font-semibold text-sub">
                    {place.secondaryText}
                  </span>
                ) : null}
              </span>
            </button>
          ))}
          {!searching &&
          !busy &&
          trimmed.length >= 2 &&
          predictions.length === 0 &&
          !errorMessage ? (
            <p className="px-3 py-2 text-[13px] font-semibold text-sub">
              {t('menu.addressSearchEmpty')}
            </p>
          ) : null}
        </div>
      ) : null}

      {!showMenu ? <FormError message={errorMessage} /> : null}
    </div>
  )
}
