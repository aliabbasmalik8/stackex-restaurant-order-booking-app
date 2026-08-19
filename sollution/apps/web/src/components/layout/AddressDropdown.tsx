import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
  type ReverseGeocodeResult,
  type UserAddressDto,
} from '@/api/OrderBooking/modules/addresses'
import { useAuth } from '@/context/AuthContext'
import { useCatalog } from '@/core/catalog'
import { getErrorMessage } from '@/lib/errors'
import { FALLBACK_BRANCH_PIN } from '@/lib/googleMapsWeb'
import { AddressEditorModal } from './AddressEditorModal'
import { AddressPlaceSearch } from './AddressPlaceSearch'

const SHEET_MAX_PX = 700

function useMinWidth(px: number) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia(`(min-width: ${px}px)`).matches,
  )

  useEffect(() => {
    const media = window.matchMedia(`(min-width: ${px}px)`)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [px])

  return matches
}

export function badgeLabel(
  address: UserAddressDto | null | undefined,
  addLabel: string,
): string {
  if (!address) return addLabel
  const area = address.area?.trim()
  if (area) return `${address.label} · ${area}`
  return address.label.trim() || address.line1.trim() || addLabel
}

function subtitle(address: UserAddressDto): string {
  return [address.line1, address.line2, address.area, address.city]
    .filter((part) => part?.trim())
    .join(' · ')
}

type EditorState =
  | null
  | { mode: 'new'; initialLookup?: ReverseGeocodeResult }
  | { mode: 'edit'; address: UserAddressDto }

export function AddressDropdown({
  hideTrigger = false,
  open: openProp,
  onOpenChange,
}: {
  hideTrigger?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
} = {}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated, requireAuth } = useAuth()
  const { primaryBranch } = useCatalog()
  const { data: addresses = [] } = useAddresses(isAuthenticated)
  const setDefaultAddress = useSetDefaultAddress()
  const createAddress = useCreateAddress()
  const updateAddress = useUpdateAddress()
  const deleteAddress = useDeleteAddress()

  const [openInternal, setOpenInternal] = useState(false)
  const open = openProp ?? openInternal
  const setOpen = (next: boolean) => {
    onOpenChange?.(next)
    if (openProp === undefined) setOpenInternal(next)
  }
  const [editor, setEditor] = useState<EditorState>(null)
  const [pendingDelete, setPendingDelete] = useState<UserAddressDto | null>(
    null,
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const asDropdown = useMinWidth(SHEET_MAX_PX)
  const anchored = asDropdown && !hideTrigger

  const defaultAddress =
    addresses.find((row) => row.isDefault) ?? addresses[0] ?? null
  const label = badgeLabel(defaultAddress, t('menu.addAddress'))
  const biasLat = defaultAddress?.lat ?? primaryBranch?.lat ?? FALLBACK_BRANCH_PIN.lat
  const biasLng = defaultAddress?.lng ?? primaryBranch?.lng ?? FALLBACK_BRANCH_PIN.lng

  const closePicker = () => setOpen(false)

  const openEditor = (next: EditorState) => {
    setErrorMessage(null)
    setOpen(false)
    setEditor(next)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (pendingDelete) {
        setPendingDelete(null)
        return
      }
      closePicker()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, pendingDelete])

  useEffect(() => {
    if (!open || !anchored) return
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) closePicker()
    }
    window.addEventListener('mousedown', onPointer)
    return () => window.removeEventListener('mousedown', onPointer)
  }, [open, anchored])

  useEffect(() => {
    if (!open || anchored) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open, anchored])

  const toggle = () => {
    if (!requireAuth('/menu')) {
      navigate('/sign-in')
      return
    }
    setOpen(!open)
  }

  const selectAddress = async (address: UserAddressDto) => {
    if (address.isDefault) {
      closePicker()
      return
    }
    setErrorMessage(null)
    try {
      await setDefaultAddress.mutateAsync(address.id)
      closePicker()
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t('menu.selectAddressFailed')))
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setErrorMessage(null)
    try {
      await deleteAddress.mutateAsync(pendingDelete.id)
      setPendingDelete(null)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, t('menu.deleteAddressFailed')))
      setPendingDelete(null)
    }
  }

  const saveEditor = async (input: {
    lookup: ReverseGeocodeResult
    label: string
    line2: string
    notes: string
  }) => {
    setErrorMessage(null)
    try {
      const body = {
        label: input.label,
        line1: input.lookup.line1 || input.lookup.formattedAddress,
        line2: input.line2,
        area: input.lookup.area,
        city: input.lookup.city || input.lookup.area || '—',
        notes: input.notes,
        lat: input.lookup.lat,
        lng: input.lookup.lng,
      }
      if (editor?.mode === 'edit') {
        await updateAddress.mutateAsync({ id: editor.address.id, body })
      } else {
        await createAddress.mutateAsync({ ...body, isDefault: true })
      }
      setEditor(null)
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          editor?.mode === 'edit'
            ? t('menu.updateAddressFailed')
            : t('menu.saveAddressFailed'),
        ),
      )
    }
  }

  const busyId = setDefaultAddress.isPending
    ? setDefaultAddress.variables
    : deleteAddress.isPending
      ? deleteAddress.variables
      : null

  const editorKey =
    editor?.mode === 'edit'
      ? editor.address.id
      : editor?.mode === 'new'
        ? `new-${editor.initialLookup?.lat ?? 'blank'}-${editor.initialLookup?.lng ?? 'blank'}`
        : 'closed'

  const picker = (
    <AddressPickerPanel
      addresses={addresses}
      biasLat={biasLat}
      biasLng={biasLng}
      busyId={busyId}
      errorMessage={errorMessage}
      showError={editor === null}
      listClassName={
        anchored ? 'max-h-[min(48vh,360px)]' : 'min-h-0 flex-1'
      }
      onClose={closePicker}
      onPickSearch={(result) => openEditor({ mode: 'new', initialLookup: result })}
      onSelect={(address) => void selectAddress(address)}
      onEdit={(address) => openEditor({ mode: 'edit', address })}
      onDelete={setPendingDelete}
      onAddNew={() => openEditor({ mode: 'new' })}
    />
  )

  return (
    <div ref={rootRef} className={hideTrigger ? '' : 'relative min-w-0'}>
      {hideTrigger ? null : (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={[
            'flex max-w-full min-w-0 items-center gap-2 rounded-pill py-2 pe-3 ps-2.5 compact:max-w-[240px] sm:max-w-[280px]',
            open
              ? 'bg-hero text-on-hero'
              : 'bg-surface text-ink',
          ].join(' ')}
        >
          <span
            className={open ? 'text-on-hero' : 'text-price'}
            aria-hidden
          >
            📍
          </span>
          <span className="min-w-0 truncate text-[13px] font-extrabold">
            {label}
          </span>
          <span className={open ? 'text-on-hero/70' : 'text-muted'} aria-hidden>
            {open ? '▴' : '▾'}
          </span>
        </button>
      )}

      {open && anchored ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-20 bg-ink/10"
            aria-label={t('common.close')}
            onClick={closePicker}
          />
          <div
            role="dialog"
            aria-label={t('menu.addressListTitle')}
            className="absolute start-0 top-[calc(100%+10px)] z-30 w-[min(92vw,380px)] overflow-visible rounded-[22px] bg-card p-4 shadow-card-hover"
          >
            {picker}
          </div>
        </>
      ) : null}

      {open && !anchored ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center side:items-center side:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label={t('common.close')}
            onClick={closePicker}
          />
          <div
            role="dialog"
            aria-label={t('menu.addressListTitle')}
            className="relative z-10 flex max-h-[min(88vh,640px)] w-full flex-col rounded-t-[22px] bg-card p-4 shadow-card-hover side:max-w-[420px] side:rounded-[22px]"
          >
            {picker}
          </div>
        </div>
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div
            role="dialog"
            aria-labelledby="delete-address-title"
            aria-describedby="delete-address-copy"
            className="w-full max-w-sm rounded-[22px] bg-card p-6 shadow-card-hover"
          >
            <h2
              id="delete-address-title"
              className="font-display text-[18px] font-bold tracking-tight"
            >
              {t('menu.deleteAddressTitle')}
            </h2>
            <p
              id="delete-address-copy"
              className="mt-2 text-[13.5px] font-semibold leading-snug text-sub"
            >
              {t('menu.deleteAddressConfirm')}
            </p>
            <p className="mt-3 truncate text-[14px] font-extrabold">
              {pendingDelete.label}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                disabled={deleteAddress.isPending}
                onClick={() => void confirmDelete()}
                className="flex h-[48px] w-full items-center justify-center rounded-pill bg-error text-[14px] font-extrabold text-on-primary disabled:opacity-55"
              >
                {t('common.delete')}
              </button>
              <button
                type="button"
                disabled={deleteAddress.isPending}
                onClick={() => setPendingDelete(null)}
                className="flex h-[48px] w-full items-center justify-center rounded-pill bg-surface text-[14px] font-extrabold text-ink"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editor !== null ? (
        <AddressEditorModal
          key={editorKey}
          editing={editor.mode === 'edit' ? editor.address : null}
          initialLookup={editor.mode === 'new' ? editor.initialLookup : undefined}
          saving={createAddress.isPending || updateAddress.isPending}
          errorMessage={errorMessage}
          onClose={() => {
            setEditor(null)
            setErrorMessage(null)
          }}
          onSave={(input) => void saveEditor(input)}
        />
      ) : null}
    </div>
  )
}

function AddressPickerPanel({
  addresses,
  biasLat,
  biasLng,
  busyId,
  errorMessage,
  showError,
  listClassName,
  onClose,
  onPickSearch,
  onSelect,
  onEdit,
  onDelete,
  onAddNew,
}: {
  addresses: UserAddressDto[]
  biasLat: number
  biasLng: number
  busyId: string | null
  errorMessage: string | null
  showError: boolean
  listClassName: string
  onClose: () => void
  onPickSearch: (result: ReverseGeocodeResult) => void
  onSelect: (address: UserAddressDto) => void
  onEdit: (address: UserAddressDto) => void
  onDelete: (address: UserAddressDto) => void
  onAddNew: () => void
}) {
  const { t } = useTranslation()

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[15px] font-bold">
          {t('menu.addressListTitle')}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="grid size-7 place-items-center rounded-full text-sub"
          aria-label={t('common.close')}
        >
          ✕
        </button>
      </div>

      <div className="mb-3">
        <AddressPlaceSearch
          autoFocus
          biasLat={biasLat}
          biasLng={biasLng}
          onPicked={onPickSearch}
        />
      </div>

      {addresses.length === 0 ? (
        <div className="px-1 py-6 text-center">
          <p className="text-[15px] font-extrabold">
            {t('menu.addressListEmpty')}
          </p>
          <p className="mt-1 text-[13px] font-semibold text-sub">
            {t('menu.addressListEmptyHint')}
          </p>
        </div>
      ) : (
        <div
          className={[
            'flex flex-col gap-2.5 overflow-y-auto',
            listClassName,
          ].join(' ')}
        >
          {addresses.map((address) => {
            const busy = busyId === address.id
            return (
              <div
                key={address.id}
                className={[
                  'flex items-center gap-2.5 rounded-[16px] border px-3 py-3',
                  address.isDefault ? 'border-cta' : 'border-border',
                  busy ? 'opacity-70' : '',
                ].join(' ')}
              >
                <button
                  type="button"
                  disabled={Boolean(busyId)}
                  onClick={() => onSelect(address)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-start"
                >
                  <span
                    className={[
                      'grid size-6 shrink-0 place-items-center rounded-full text-[12px] font-extrabold',
                      address.isDefault
                        ? 'bg-cta text-on-primary'
                        : 'border-[1.5px] border-border text-muted',
                    ].join(' ')}
                  >
                    {address.isDefault ? '✓' : ''}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[14px] font-extrabold">
                        {address.label}
                      </span>
                      {address.isDefault ? (
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-cta">
                          {t('menu.addressDefault')}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 line-clamp-2 text-[12.5px] font-semibold text-sub">
                      {subtitle(address)}
                    </span>
                  </span>
                </button>
                <div className="flex shrink-0 gap-0.5">
                  <button
                    type="button"
                    disabled={Boolean(busyId)}
                    onClick={() => onEdit(address)}
                    className="grid size-7 place-items-center rounded-full text-sub"
                    aria-label={t('common.edit')}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busyId)}
                    onClick={() => onDelete(address)}
                    className="grid size-7 place-items-center rounded-full text-muted"
                    aria-label={t('common.delete')}
                  >
                    🗑
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showError && errorMessage ? (
        <p className="mt-2 text-[12.5px] font-semibold text-error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="button"
        disabled={Boolean(busyId)}
        onClick={onAddNew}
        className="mt-3 flex h-[48px] w-full shrink-0 items-center justify-center rounded-pill bg-cta text-[14px] font-extrabold text-on-primary shadow-cta disabled:opacity-55"
      >
        {t('menu.addNewAddressCta')}
      </button>
    </>
  )
}
