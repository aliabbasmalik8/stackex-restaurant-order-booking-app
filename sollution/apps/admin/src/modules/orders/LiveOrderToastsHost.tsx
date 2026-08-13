import { LiveToasts } from '@/components/live/LiveToasts'
import { useLiveOrderToasts } from './hooks/useLiveOrderToasts'

export function LiveOrderToastsHost() {
  const { toasts, dismiss, onOpen } = useLiveOrderToasts()
  return <LiveToasts toasts={toasts} onDismiss={dismiss} onOpen={onOpen} />
}
