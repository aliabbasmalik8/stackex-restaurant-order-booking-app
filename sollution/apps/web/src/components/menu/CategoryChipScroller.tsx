import { useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { useLanguage } from '@/i18n/LanguageContext'

export function CategoryChipScroller({
  categories,
  activeId,
  onChange,
}: {
  categories: { id: string; label: string }[]
  activeId: string
  onChange: (id: string) => void
}) {
  const { isRTL } = useLanguage()
  const [viewportRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
    direction: isRTL ? 'rtl' : 'ltr',
  })

  useEffect(() => {
    emblaApi?.reInit()
  }, [emblaApi, categories, isRTL])

  useEffect(() => {
    if (!emblaApi) return
    const index = categories.findIndex((chip) => chip.id === activeId)
    if (index >= 0) emblaApi.scrollTo(index)
  }, [activeId, categories, emblaApi])

  useEffect(() => {
    const viewport = emblaApi?.rootNode()
    if (!viewport || !emblaApi) return

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return
      const delta = event.deltaX !== 0 ? event.deltaX : event.deltaY
      if (delta === 0) return
      event.preventDefault()
      const snaps = emblaApi.scrollSnapList().length
      const next = Math.min(
        snaps - 1,
        Math.max(0, emblaApi.selectedScrollSnap() + Math.sign(delta)),
      )
      emblaApi.scrollTo(next)
    }

    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', onWheel)
  }, [emblaApi])

  return (
    <div className="chip-scroller shrink-0" ref={viewportRef}>
      <div className="chip-scroller__row">
        {categories.map((chip) => {
          const active = chip.id === activeId
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onChange(chip.id)}
              className={[
                'chip-scroller__chip',
                active
                  ? 'bg-sel font-extrabold text-sel-text'
                  : 'bg-page font-bold text-ink',
              ].join(' ')}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
