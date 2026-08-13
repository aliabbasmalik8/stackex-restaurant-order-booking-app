import { useEffect, useRef } from 'react'
import {
  subscribeLiveAny,
  subscribeLiveEvent,
  subscribeLiveEvents,
} from './live.helpers'
import type { LiveChangeEvent, LiveEventName, LiveTypedEvent } from './live.types'

export function useLiveEvent<T extends string>(
  type: T,
  handler: (
    event: T extends LiveEventName ? LiveTypedEvent<T> : LiveChangeEvent,
  ) => void,
): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    return subscribeLiveEvent(type, (event) => {
      handlerRef.current(event)
    })
  }, [type])
}

export function useLiveEvents(
  types: readonly string[],
  handler: (event: LiveChangeEvent) => void,
): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler
  const typesKey = types.join('\0')

  useEffect(() => {
    const list = typesKey ? typesKey.split('\0') : []
    if (list.length === 0) return
    return subscribeLiveEvents(list, (event) => {
      handlerRef.current(event)
    })
  }, [typesKey])
}

export function useLiveAnyEvent(handler: (event: LiveChangeEvent) => void): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    return subscribeLiveAny((event) => {
      handlerRef.current(event)
    })
  }, [])
}
