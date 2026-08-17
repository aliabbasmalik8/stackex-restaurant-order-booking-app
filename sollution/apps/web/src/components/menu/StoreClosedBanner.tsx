import { useStoreAvailability } from '@/core/settings'

export function StoreClosedBanner() {
  const { isClosed, closedMessage } = useStoreAvailability()
  if (!isClosed) return null

  return (
    <div
      className="flex items-start gap-2.5 rounded-lg border border-amber-500 bg-amber-50 px-3.5 py-3 text-[13.5px] font-semibold leading-snug text-amber-800"
      role="status"
    >
      <span aria-hidden>⏱</span>
      <span>{closedMessage}</span>
    </div>
  )
}
