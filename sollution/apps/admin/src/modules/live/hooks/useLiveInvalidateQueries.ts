import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  useLiveAnyEvent,
  type LiveChangeEvent,
} from '@/api/OrderBooking/Live'
import { queryKeysForLiveEvent } from '../live.queryMap'

/** Global: any live change → invalidate matching React Query keys. */
export function useLiveInvalidateQueries(): void {
  const queryClient = useQueryClient()

  const onEvent = useCallback(
    (event: LiveChangeEvent) => {
      for (const queryKey of queryKeysForLiveEvent(event.type)) {
        void queryClient.invalidateQueries({ queryKey })
      }
    },
    [queryClient],
  )

  useLiveAnyEvent(onEvent)
}
