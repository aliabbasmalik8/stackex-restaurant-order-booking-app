import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QtyStepper, StateMessage, Text } from '@/components/ui'
import { StoreClosedBanner } from '@/components/menu/StoreClosedBanner'
import { useCart } from '@/context/CartContext'
import { useMenuItem, type ModifierChoice } from '@/core/catalog'
import { useStoreAvailability } from '@/core/settings'
import { AppError } from '@/lib/errors'
import { localized } from '@/utils/localized'
import { money } from '@/utils/money'
import { useLanguage } from '@/i18n/LanguageContext'

export function ItemCustomizeModal({
  itemId,
  onClose,
}: {
  itemId: string | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { locale } = useLanguage()
  const { addItem } = useCart()
  const { isClosed } = useStoreAvailability()
  const { item, isLoading, errorCode, error } = useMenuItem(itemId)
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')
  const [singleIds, setSingleIds] = useState<Record<string, string>>({})
  const [multiIds, setMultiIds] = useState<Record<string, string[]>>({})
  const [addError, setAddError] = useState<string | null>(null)

  useEffect(() => {
    if (!itemId) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [itemId, onClose])

  useEffect(() => {
    if (!item) return
    const nextSingle: Record<string, string> = {}
    const nextMulti: Record<string, string[]> = {}
    for (const group of item.modifiers ?? []) {
      if (group.type === 'single') {
        nextSingle[group.id] = group.options[0]?.id ?? ''
      } else {
        nextMulti[group.id] = []
      }
    }
    setSingleIds(nextSingle)
    setMultiIds(nextMulti)
    setQty(1)
    setNote('')
    setAddError(null)
  }, [item?.id])

  const selectedChoices = useMemo(() => {
    if (!item) return [] as ModifierChoice[]
    const list: ModifierChoice[] = []
    for (const group of item.modifiers ?? []) {
      if (group.type === 'single') {
        const choice = group.options.find((o) => o.id === singleIds[group.id])
        if (choice) list.push(choice)
      } else {
        const ids = multiIds[group.id] ?? []
        for (const option of group.options) {
          if (ids.includes(option.id)) list.push(option)
        }
      }
    }
    return list
  }, [item, singleIds, multiIds])

  const unitPrice = useMemo(() => {
    if (!item) return 0
    return item.price + selectedChoices.reduce((sum, c) => sum + c.price, 0)
  }, [item, selectedChoices])

  const requiredOk = useMemo(() => {
    if (!item) return false
    return (item.modifiers ?? []).every((group) => {
      if (!group.required) return true
      if (group.type === 'single') return Boolean(singleIds[group.id])
      return (multiIds[group.id] ?? []).length > 0
    })
  }, [item, singleIds, multiIds])

  if (!itemId) return null

  const toggleMulti = (groupId: string, optionId: string) => {
    setMultiIds((prev) => {
      const current = prev[groupId] ?? []
      return {
        ...prev,
        [groupId]: current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId],
      }
    })
  }

  const handleAdd = () => {
    if (!item || !requiredOk) return
    setAddError(null)
    try {
      addItem({
        menuItemId: item.id,
        name: item.name,
        name_arabic: item.name_arabic,
        image: item.image,
        unitPrice,
        quantity: qty,
        optionsSummary: selectedChoices.map((c) => c.label).join(' · '),
        optionsSummary_arabic: selectedChoices
          .map((c) => c.label_arabic)
          .join(' · '),
        selectedOptionIds: selectedChoices.map((c) => c.id),
        specialInstructions: note.trim(),
      })
      onClose()
    } catch (err) {
      if (err instanceof AppError && err.code === 'store_closed') {
        setAddError(t('store.addUnavailable'))
        return
      }
      setAddError(t('errors.unknown.message'))
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="item-modal-title"
        className="flex max-h-[94vh] w-full max-w-[880px] flex-col overflow-hidden rounded-t-[26px] bg-sheet shadow-[0_40px_90px_rgba(0,0,0,.4)] sm:max-h-[780px] sm:rounded-[26px] md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="relative flex min-h-[360px] flex-1 items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="absolute end-5 top-5 grid size-[38px] place-items-center rounded-full bg-surface text-sub"
              aria-label={t('common.close')}
            >
              ✕
            </button>
            <Text variant="subtitle" className="text-sub">
              {t('common.loading')}
            </Text>
          </div>
        ) : errorCode || !item ? (
          <div className="relative flex min-h-[360px] flex-1 items-center justify-center px-6">
            <button
              type="button"
              onClick={onClose}
              className="absolute end-5 top-5 grid size-[38px] place-items-center rounded-full bg-surface text-sub"
              aria-label={t('common.close')}
            >
              ✕
            </button>
            <StateMessage errorCode={errorCode ?? 'not_found'} error={error} />
          </div>
        ) : (
          <>
            <div className="relative h-48 shrink-0 overflow-hidden bg-placeholder sm:h-56 md:h-auto md:w-[360px]">
              {item.image ? (
                <img
                  src={item.image}
                  alt=""
                  className="size-full object-cover"
                />
              ) : null}
              {item.badge || item.featured ? (
                <span className="absolute start-4 top-4 rounded-pill bg-badge px-3 py-1.5 text-[10.5px] font-extrabold uppercase text-badge-text">
                  {localized(locale, item.badge ?? '', item.badge_arabic) ||
                    t('menu.popular')}
                </span>
              ) : null}
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-7">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h2
                    id="item-modal-title"
                    className="font-display text-[24px] font-bold tracking-tight"
                  >
                    {localized(locale, item.name, item.name_arabic)}
                  </h2>
                  <p className="text-[13.5px] font-semibold leading-relaxed text-sub">
                    {localized(
                      locale,
                      item.longDescription ?? item.description,
                      item.longDescription_arabic ?? item.description_arabic,
                    )}
                  </p>
                  {item.calories ? (
                    <span className="text-[12px] font-bold text-muted">
                      {t('item.cal', { count: item.calories })}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid size-[38px] shrink-0 place-items-center rounded-full bg-surface text-[16px] text-sub"
                  aria-label={t('common.close')}
                >
                  ✕
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-4.5 overflow-y-auto px-6 py-5 sm:px-7">
                {(item.modifiers ?? []).map((group) => (
                  <section key={group.id} className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[13.5px] font-extrabold">
                        {localized(locale, group.label, group.label_arabic)}
                      </span>
                      {group.required ? (
                        <span className="rounded-pill bg-surface px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-sub">
                          {t('common.required')}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-muted">
                          {t('common.optional')}
                        </span>
                      )}
                    </div>

                    {group.type === 'single' ? (
                      <div className="flex flex-wrap gap-2.5">
                        {group.options.map((opt) => {
                          const active = singleIds[group.id] === opt.id
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() =>
                                setSingleIds((prev) => ({
                                  ...prev,
                                  [group.id]: opt.id,
                                }))
                              }
                              className={[
                                'flex min-w-[140px] flex-1 items-center justify-between rounded-[15px] px-4 py-3.5 text-start',
                                active
                                  ? 'bg-sel text-sel-text shadow-card'
                                  : 'border-2 border-border',
                              ].join(' ')}
                            >
                              <span className="text-[13px] font-extrabold">
                                {localized(locale, opt.label, opt.label_arabic)}
                              </span>
                              <span
                                className={[
                                  'text-[12px] font-bold',
                                  active ? 'opacity-80' : 'text-sub',
                                ].join(' ')}
                              >
                                {opt.price
                                  ? money(item.price + opt.price)
                                  : money(item.price)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {group.options.map((opt) => {
                          const active = (multiIds[group.id] ?? []).includes(
                            opt.id,
                          )
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => toggleMulti(group.id, opt.id)}
                              className="flex items-center gap-3 rounded-[14px] bg-card px-[15px] py-3 text-start shadow-card"
                            >
                              <span
                                className={[
                                  'grid size-[21px] shrink-0 place-items-center rounded-[7px] text-[12px] font-extrabold',
                                  active
                                    ? 'bg-check text-check-text'
                                    : 'border-2 border-border',
                                ].join(' ')}
                              >
                                {active ? '✓' : null}
                              </span>
                              <span className="flex-1 text-[12.5px] font-bold">
                                {localized(locale, opt.label, opt.label_arabic)}
                              </span>
                              <span className="text-[11.5px] font-bold text-sub">
                                {opt.price
                                  ? `+${money(opt.price)}`
                                  : t('common.included')}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </section>
                ))}

                <label className="flex flex-col gap-2">
                  <span className="text-[13.5px] font-extrabold">
                    {t('item.specialInstructions')}
                  </span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={200}
                    rows={2}
                    placeholder={t('item.specialInstructionsPlaceholder')}
                    className="resize-none rounded-[14px] bg-card px-[15px] py-3 text-[12.5px] font-semibold text-ink shadow-card outline-none placeholder:text-muted focus:ring-2 focus:ring-cta/15"
                  />
                </label>
              </div>

              <div className="flex shrink-0 flex-col gap-3 px-6 pb-6 pt-[18px] shadow-[0_-1px_0_var(--divider)] sm:px-7">
                {isClosed ? <StoreClosedBanner /> : null}
                {addError ? (
                  <p className="text-[12.5px] font-bold text-error">{addError}</p>
                ) : null}
                {item.available === false ? (
                  <p className="text-[12.5px] font-bold text-error">
                    {t('errors.item_unavailable.message')}
                  </p>
                ) : null}
                {!isClosed && item.available !== false ? (
                  <div className="flex items-center gap-3.5">
                    <QtyStepper value={qty} onChange={setQty} />
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={!requiredOk}
                      className="flex h-[52px] flex-1 items-center justify-between rounded-pill bg-cta px-2.5 ps-[22px] text-on-primary shadow-cta disabled:opacity-45"
                    >
                      <span className="text-[14.5px] font-extrabold">
                        {t('item.addToOrder')}
                      </span>
                      <span className="rounded-pill bg-white/16 px-[15px] py-[9px] text-[13px] font-extrabold">
                        {money(unitPrice * qty)}
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
