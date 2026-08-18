import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useReverseGeocode,
  type ReverseGeocodeResult,
  type UserAddressDto,
} from '@/api/OrderBooking/modules/addresses'
import { Button, Field, FormError, Text } from '@/components/ui'
import { AddressPinMap } from '@/components/layout/AddressPinMap'
import { getErrorMessage } from '@/lib/errors'
import { FALLBACK_BRANCH_PIN } from '@/lib/googleMapsWeb'
import { useCatalog } from '@/core/catalog'

const PIN_STILL_DELTA = 0.00022
const LABEL_KEYS = ['home', 'work', 'other'] as const
type AddressLabelKey = (typeof LABEL_KEYS)[number]
type EditorStep = 'pin' | 'details'

function lookupFromAddress(address: UserAddressDto): ReverseGeocodeResult {
  return {
    line1: address.line1,
    line2: address.line2,
    area: address.area,
    city: address.city,
    formattedAddress: [address.line1, address.line2, address.area, address.city]
      .filter((part) => part?.trim())
      .join(', '),
    lat: address.lat,
    lng: address.lng,
  }
}

function pinUnchanged(
  pin: { lat: number; lng: number } | null,
  origin: { lat: number; lng: number } | null,
): boolean {
  if (!pin || !origin) return false
  return (
    Math.abs(pin.lat - origin.lat) < PIN_STILL_DELTA &&
    Math.abs(pin.lng - origin.lng) < PIN_STILL_DELTA
  )
}

function labelKeyFromSaved(
  label: string,
  labels: Record<AddressLabelKey, string>,
): AddressLabelKey {
  const trimmed = label.trim()
  for (const key of LABEL_KEYS) {
    if (labels[key] === trimmed) return key
  }
  const lower = trimmed.toLowerCase()
  if (lower === 'home') return 'home'
  if (lower === 'work') return 'work'
  return 'other'
}

export function AddressEditorModal({
  editing,
  initialLookup,
  onClose,
  onSave,
  saving,
  errorMessage,
}: {
  editing: UserAddressDto | null
  initialLookup?: ReverseGeocodeResult | null
  onClose: () => void
  onSave: (input: {
    lookup: ReverseGeocodeResult
    label: string
    line2: string
    notes: string
  }) => void
  saving: boolean
  errorMessage: string | null
}) {
  const { t } = useTranslation()
  const { primaryBranch } = useCatalog()
  const reverseGeocode = useReverseGeocode()
  const startLookup = initialLookup ?? (editing ? lookupFromAddress(editing) : null)
  const startLat =
    startLookup?.lat ?? editing?.lat ?? primaryBranch?.lat ?? FALLBACK_BRANCH_PIN.lat
  const startLng =
    startLookup?.lng ?? editing?.lng ?? primaryBranch?.lng ?? FALLBACK_BRANCH_PIN.lng
  const [step, setStep] = useState<EditorStep>('pin')
  const [pin, setPin] = useState<{ lat: number; lng: number }>({
    lat: startLat,
    lng: startLng,
  })
  const [lookup, setLookup] = useState<ReverseGeocodeResult | null>(startLookup)
  const [pickedLookup, setPickedLookup] =
    useState<ReverseGeocodeResult | null>(initialLookup ?? null)
  const [pinError, setPinError] = useState<string | null>(null)

  const keepExisting = Boolean(editing) && pinUnchanged(pin, editing)
  const keepPicked = Boolean(pickedLookup) && pinUnchanged(pin, pickedLookup)
  const skipGeocode = keepExisting || keepPicked

  const confirmPin = async () => {
    if (editing && keepExisting) {
      setPinError(null)
      setLookup(lookupFromAddress(editing))
      setStep('details')
      return
    }
    if (pickedLookup && pinUnchanged(pin, pickedLookup)) {
      setPinError(null)
      setLookup(pickedLookup)
      setStep('details')
      return
    }
    if (!pin) {
      setPinError(t('menu.needLocationFirst'))
      return
    }
    setPinError(null)
    try {
      const result = await reverseGeocode.mutateAsync({
        lat: pin.lat,
        lng: pin.lng,
      })
      setLookup(result)
      setStep('details')
    } catch (error) {
      setLookup(null)
      setPinError(getErrorMessage(error, t('menu.addressLookupFailed')))
    }
  }

  const title =
    step === 'details'
      ? t('menu.addressDetailsTitle')
      : editing
        ? t('menu.editAddressTitle')
        : t('menu.addressSheetTitle')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(21,34,56,0.45)]"
        aria-label={t('common.close')}
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(92vh,800px)] w-full max-w-[560px] flex-col overflow-visible rounded-[24px] bg-card shadow-card-hover">
        <div className="flex items-center gap-2 px-6 pt-5">
          {step !== 'pin' ? (
            <button
              type="button"
              onClick={() => {
                setPinError(null)
                setStep('pin')
              }}
              className="grid size-9 place-items-center rounded-full bg-surface text-lg"
              aria-label={t('common.back')}
            >
              ‹
            </button>
          ) : null}
          <h2 className="min-w-0 flex-1 font-display text-[18px] font-bold tracking-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-[16px] text-sub"
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>

        <div
          className={[
            'min-h-0 flex-1 px-6 py-4',
            step === 'details' ? 'overflow-y-auto' : 'overflow-visible',
          ].join(' ')}
        >
          {step === 'pin' ? (
            <AddressPinMap
              lat={pin.lat}
              lng={pin.lng}
              onPinChange={(nextLat, nextLng) => {
                setPin({ lat: nextLat, lng: nextLng })
                setPickedLookup((current) =>
                  pinUnchanged({ lat: nextLat, lng: nextLng }, current)
                    ? current
                    : null,
                )
              }}
              onPlacePicked={(result) => {
                setPin({ lat: result.lat, lng: result.lng })
                setPickedLookup(result)
                setLookup(result)
                setPinError(null)
              }}
            />
          ) : null}

          {step === 'details' && lookup ? (
            <AddressDetails
              lookup={lookup}
              editing={editing}
              saving={saving}
              errorMessage={errorMessage}
              onChangeLocation={() => {
                setPinError(null)
                setStep('pin')
              }}
              onSave={(input) => onSave({ lookup, ...input })}
            />
          ) : null}

          {step === 'pin' ? <FormError message={pinError} /> : null}
        </div>

        {step === 'pin' ? (
          <div className="px-6 pb-5">
            <Button
              label={
                skipGeocode
                  ? t('menu.continueLocation')
                  : t('menu.confirmLocation')
              }
              loading={!skipGeocode && reverseGeocode.isPending}
              disabled={!skipGeocode && reverseGeocode.isPending}
              onClick={() => void confirmPin()}
              className="w-full"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function AddressDetails({
  lookup,
  editing,
  saving,
  errorMessage,
  onChangeLocation,
  onSave,
}: {
  lookup: ReverseGeocodeResult
  editing: UserAddressDto | null
  saving: boolean
  errorMessage: string | null
  onChangeLocation: () => void
  onSave: (input: { label: string; line2: string; notes: string }) => void
}) {
  const { t } = useTranslation()
  const [labelKey, setLabelKey] = useState<AddressLabelKey>(() =>
    editing
      ? labelKeyFromSaved(editing.label, {
          home: t('menu.addressLabels.home'),
          work: t('menu.addressLabels.work'),
          other: t('menu.addressLabels.other'),
        })
      : 'home',
  )
  const [floor, setFloor] = useState(editing?.line2 ?? lookup.line2)
  const [notes, setNotes] = useState(editing?.notes ?? '')
  const placeLine = [lookup.area, lookup.city].filter(Boolean).join(' · ')

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-surface p-3.5">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.04em] text-cta">
          {t('menu.addressFound')}
        </p>
        <p className="mt-1 text-[15px] font-semibold leading-snug">
          {lookup.line1 || lookup.formattedAddress}
        </p>
        {placeLine ? (
          <p className="mt-0.5 text-[13px] font-semibold text-sub">{placeLine}</p>
        ) : null}
        <button
          type="button"
          onClick={onChangeLocation}
          className="mt-2 text-[12.5px] font-extrabold text-link"
        >
          {t('common.change')}
        </button>
      </div>

      <div>
        <Text as="span" variant="label" className="ps-1.5">
          {t('menu.addressLabel')}
        </Text>
        <div className="mt-2 flex gap-2">
          {LABEL_KEYS.map((key) => {
            const selected = key === labelKey
            return (
              <button
                key={key}
                type="button"
                onClick={() => setLabelKey(key)}
                className={[
                  'h-10 rounded-pill px-4 text-[13px] font-extrabold',
                  selected
                    ? 'bg-sel text-sel-text'
                    : 'border border-border bg-surface text-ink',
                ].join(' ')}
              >
                {t(`menu.addressLabels.${key}`)}
              </button>
            )
          })}
        </div>
      </div>

      <Field
        label={`${t('menu.addressFloor')} (${t('common.optional')})`}
        value={floor}
        onChange={(e) => setFloor(e.target.value)}
        placeholder={t('menu.addressFloorPlaceholder')}
      />
      <Field
        label={`${t('menu.addressNotes')} (${t('common.optional')})`}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder={t('menu.addressNotesPlaceholder')}
      />
      <FormError message={errorMessage} />
      <Button
        label={
          editing ? t('menu.saveAddressChanges') : t('menu.saveAddress')
        }
        loading={saving}
        disabled={saving}
        onClick={() =>
          onSave({
            label: t(`menu.addressLabels.${labelKey}`),
            line2: floor.trim(),
            notes: notes.trim(),
          })
        }
        className="w-full"
      />
    </div>
  )
}
