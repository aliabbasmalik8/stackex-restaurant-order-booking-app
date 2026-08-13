/** Catalog names — keep in sync with backend `APP_EVENTS`. */
export const LIVE_EVENT = {
  ORDER_PLACED: 'order.placed',
  ORDER_STATUS_CHANGED: 'order.status_changed',
} as const

export type LiveEventName = (typeof LIVE_EVENT)[keyof typeof LIVE_EVENT]

export type LiveEventPayloadMap = {
  [LIVE_EVENT.ORDER_PLACED]: {
    orderId: string
    orderCode: number
    userId: string
    branchId: string | null
    status: string
    paymentMethod: string
    paymentStatus: string
    total: number
  }
  [LIVE_EVENT.ORDER_STATUS_CHANGED]: {
    orderId: string
    orderCode: number
    userId: string
    status: string
  }
}

export type LiveTypedEvent<T extends LiveEventName = LiveEventName> = {
  [K in T]: {
    type: K
    payload: LiveEventPayloadMap[K]
    at: string
  }
}[T]

/** Known catalog event or a future unknown `type` from the stream. */
export type LiveChangeEvent =
  | LiveTypedEvent
  | {
      type: string
      payload?: unknown
      at: string
    }

export type LivePingEvent = {
  type: 'ping'
  at: string
}

export type LiveStreamMessage = LivePingEvent | LiveChangeEvent
