export function formatReadyAround(
  from = new Date(),
  minutes = 20,
  locale?: string,
): string {
  const d = new Date(from.getTime() + minutes * 60_000)
  return d.toLocaleTimeString(locale === 'ar' ? 'ar' : undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export type PickupSlot = {
  id: string
  label: string
  readyAround: string
}

function roundUpToQuarter(date: Date): Date {
  const d = new Date(date)
  d.setSeconds(0, 0)
  const minutes = d.getMinutes()
  const rem = minutes % 15
  d.setMinutes(rem === 0 ? minutes + 15 : minutes + (15 - rem))
  return d
}

export function buildPickupSlots(
  etaMinutes: number,
  locale?: string,
): PickupSlot[] {
  const asap = new Date(Date.now() + etaMinutes * 60_000)
  const start = roundUpToQuarter(asap)
  const slots: PickupSlot[] = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(start.getTime() + i * 15 * 60_000)
    const label = d.toLocaleTimeString(locale === 'ar' ? 'ar' : undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })
    slots.push({ id: `s${i}`, label, readyAround: label })
  }
  return slots
}
