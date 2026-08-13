import type { LiveChangeEvent, LiveEventName, LiveTypedEvent } from './live.types'

type AnyChangeHandler = (event: LiveChangeEvent) => void

const handlersByType = new Map<string, Set<AnyChangeHandler>>()
const anyHandlers = new Set<AnyChangeHandler>()

export function dispatchLiveChange(event: LiveChangeEvent): void {
  anyHandlers.forEach((handler) => handler(event))
  handlersByType.get(event.type)?.forEach((handler) => handler(event))
}

export function subscribeLiveEvent<T extends string>(
  type: T,
  handler: (
    event: T extends LiveEventName ? LiveTypedEvent<T> : LiveChangeEvent,
  ) => void,
): () => void {
  let handlers = handlersByType.get(type)
  if (!handlers) {
    handlers = new Set()
    handlersByType.set(type, handlers)
  }
  handlers.add(handler as AnyChangeHandler)
  return () => {
    handlers.delete(handler as AnyChangeHandler)
    if (handlers.size === 0) handlersByType.delete(type)
  }
}

export function subscribeLiveEvents(
  types: readonly string[],
  handler: (event: LiveChangeEvent) => void,
): () => void {
  const unsubs = types.map((type) => subscribeLiveEvent(type, handler))
  return () => {
    unsubs.forEach((unsubscribe) => unsubscribe())
  }
}

export function subscribeLiveAny(handler: (event: LiveChangeEvent) => void): () => void {
  anyHandlers.add(handler)
  return () => {
    anyHandlers.delete(handler)
  }
}
