import { getAccessToken } from '@/utils/auth/session'
import { dispatchLiveChange } from './live.helpers'
import type { LiveStreamMessage } from './live.types'

const ORDER_BOOKING_API_BASE_URL =
  (import.meta.env.VITE_API_URL ?? 'http://localhost:8000') + '/api'

const MAX_BACKOFF_MS = 15_000

let started = false
let abort: AbortController | null = null
let retryTimer: ReturnType<typeof setTimeout> | undefined

function isLiveStreamMessage(value: unknown): value is LiveStreamMessage {
  if (!value || typeof value !== 'object') return false
  const type = (value as { type?: unknown }).type
  const at = (value as { at?: unknown }).at
  return typeof type === 'string' && typeof at === 'string'
}

function parseSseBuffer(buffer: string): {
  messages: LiveStreamMessage[]
  rest: string
} {
  const blocks = buffer.split(/\n\n/)
  const rest = blocks.pop() ?? ''
  const messages: LiveStreamMessage[] = []

  for (const block of blocks) {
    const data = block
      .split(/\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n')
    if (!data) continue
    try {
      const parsed: unknown = JSON.parse(data)
      if (isLiveStreamMessage(parsed)) messages.push(parsed)
    } catch {
      /* ignore malformed chunk */
    }
  }

  return { messages, rest }
}

async function readStream(signal: AbortSignal): Promise<{ status: number } | void> {
  const token = getAccessToken()
  if (!token) return { status: 401 }

  const response = await fetch(`${ORDER_BOOKING_API_BASE_URL}/live/admin/stream`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
    },
    signal,
  })

  if (!response.ok) return { status: response.status }

  const body = response.body
  if (!body) return

  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const parsed = parseSseBuffer(buffer)
      buffer = parsed.rest
      for (const message of parsed.messages) {
        if (message.type === 'ping') continue
        dispatchLiveChange(message)
      }
    }
  } finally {
    reader.releaseLock()
  }
}

async function runLoop(signal: AbortSignal): Promise<void> {
  let backoffMs = 1_000

  while (started && !signal.aborted) {
    try {
      const result = await readStream(signal)
      if (!started || signal.aborted) return
      if (result?.status === 401 || result?.status === 403) {
        disconnectAdminLive()
        return
      }
      backoffMs = 1_000
    } catch (error) {
      if (!started || signal.aborted) return
      if (error instanceof DOMException && error.name === 'AbortError') return
    }

    if (!started || signal.aborted) return
    await new Promise<void>((resolve) => {
      retryTimer = setTimeout(resolve, backoffMs)
    })
    backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS)
  }
}

/** Open the singleton admin SSE connection (no-op if already running). */
export function connectAdminLive(): void {
  if (started) return
  started = true
  abort = new AbortController()
  void runLoop(abort.signal)
}

export function disconnectAdminLive(): void {
  started = false
  abort?.abort()
  abort = null
  if (retryTimer) {
    clearTimeout(retryTimer)
    retryTimer = undefined
  }
}
