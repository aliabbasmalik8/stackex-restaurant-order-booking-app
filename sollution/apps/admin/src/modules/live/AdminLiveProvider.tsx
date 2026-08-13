import type { ReactNode } from 'react'
import { LiveOrderToastsHost } from '@/modules/orders/LiveOrderToastsHost'
import { LiveInitializer } from './LiveInitializer'

export function AdminLiveProvider({ children }: { children: ReactNode }) {
  return (
    <>
      <LiveInitializer />
      <LiveOrderToastsHost />
      {children}
    </>
  )
}
