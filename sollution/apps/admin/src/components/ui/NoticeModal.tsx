import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button, Text } from '@/components/ui'

type Props = {
  open: boolean
  title: string
  body: string
  confirmLabel: string
  onClose: () => void
  children?: ReactNode
}

/**
 * Lightweight centered notice (no focus trap library).
 * Portaled to `document.body` so parents like `.dash-panel` (overflow:hidden)
 * cannot clip the overlay. Escape / backdrop click dismisses.
 */
export function NoticeModal({
  open,
  title,
  body,
  confirmLabel,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/45 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-modal-title"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <Text
          as="h2"
          id="notice-modal-title"
          variant="bodyStrong"
          className="text-lg"
        >
          {title}
        </Text>
        <Text variant="body" className="mt-2 text-muted">
          {body}
        </Text>
        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            variant="primary"
            label={confirmLabel}
            onClick={onClose}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
