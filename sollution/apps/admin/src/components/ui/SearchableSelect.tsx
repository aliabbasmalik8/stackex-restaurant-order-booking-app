import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Text } from '@/components/ui/Text'

export type SearchableSelectOption = {
  value: string
  label: string
  /** Extra text matched by search (e.g. full currency name). */
  searchText?: string
  /** Optional secondary line in the menu. */
  description?: string
}

type SearchableSelectProps = {
  label: string
  value: string
  options: SearchableSelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  badge?: ReactNode
  hint?: string
  error?: string | null
  disabled?: boolean
  className?: string
  name?: string
  id?: string
}

type MenuPosition = {
  top?: number
  bottom?: number
  left: number
  width: number
  maxHeight: number
  placement: 'bottom' | 'top'
}

const MENU_GAP = 8
const MENU_MAX = 280
const VIEWPORT_PAD = 8

function matchesQuery(option: SearchableSelectOption, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [option.value, option.label, option.searchText, option.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

function computeMenuPosition(trigger: DOMRect): MenuPosition {
  const spaceBelow = window.innerHeight - trigger.bottom - VIEWPORT_PAD
  const spaceAbove = trigger.top - VIEWPORT_PAD
  const preferBottom = spaceBelow >= 180 || spaceBelow >= spaceAbove
  const available = preferBottom ? spaceBelow : spaceAbove
  const maxHeight = Math.max(140, Math.min(MENU_MAX, available - MENU_GAP))

  if (preferBottom) {
    return {
      top: trigger.bottom + MENU_GAP,
      left: trigger.left,
      width: trigger.width,
      maxHeight,
      placement: 'bottom',
    }
  }

  return {
    bottom: window.innerHeight - trigger.top + MENU_GAP,
    left: trigger.left,
    width: trigger.width,
    maxHeight,
    placement: 'top',
  }
}

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  emptyMessage = 'No matches',
  badge,
  hint,
  error,
  disabled = false,
  className = '',
  name,
  id,
}: SearchableSelectProps) {
  const reactId = useId()
  const fieldId = id ?? name ?? reactId
  const listId = `${fieldId}-listbox`
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null)

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  )

  const filtered = useMemo(
    () => options.filter((o) => matchesQuery(o, query)),
    [options, query],
  )

  const updatePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    setMenuPos(computeMenuPosition(rect))
  }

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null)
      return
    }
    updatePosition()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onReposition = () => updatePosition()
    window.addEventListener('resize', onReposition)
    // Capture scroll from nested containers too
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setOpen(false)
      setQuery('')
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    setActiveIndex(0)
    const t = window.setTimeout(() => searchRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (activeIndex >= filtered.length) {
      setActiveIndex(Math.max(0, filtered.length - 1))
    }
  }, [filtered.length, activeIndex])

  const close = () => {
    setOpen(false)
    setQuery('')
  }

  const pick = (next: string) => {
    onChange(next)
    close()
  }

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setOpen(true)
    }
  }

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const option = filtered[activeIndex]
      if (option) pick(option.value)
    }
  }

  const menuStyle: CSSProperties | undefined = menuPos
    ? {
        position: 'fixed',
        top: menuPos.top,
        bottom: menuPos.bottom,
        left: menuPos.left,
        width: menuPos.width,
        maxHeight: menuPos.maxHeight,
        zIndex: 80,
      }
    : undefined

  const menu =
    open && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            style={menuStyle}
            className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-panel"
            role="presentation"
          >
            <div className="shrink-0 border-b border-divider p-2">
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-md border border-border bg-surface px-3 text-sm font-semibold text-ink outline-none placeholder:text-muted focus:border-cta focus:ring-2 focus:ring-cta/20"
                aria-autocomplete="list"
                aria-controls={listId}
                autoComplete="off"
              />
            </div>
            <ul
              id={listId}
              role="listbox"
              aria-label={label}
              className="min-h-0 flex-1 overflow-y-auto py-1"
            >
              {filtered.length === 0 ? (
                <li className="px-4 py-3 text-sm font-semibold text-muted">
                  {emptyMessage}
                </li>
              ) : (
                filtered.map((option, index) => {
                  const isSelected = option.value === value
                  const isActive = index === activeIndex
                  return (
                    <li key={option.value} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={[
                          'flex w-full items-baseline justify-between gap-3 px-4 py-2.5 text-start text-sm',
                          isActive ? 'bg-surface' : 'bg-transparent',
                          isSelected
                            ? 'font-extrabold text-ink'
                            : 'font-semibold text-sub',
                          'hover:bg-surface',
                        ].join(' ')}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => pick(option.value)}
                      >
                        <span className="text-ink">{option.label}</span>
                        {option.description ? (
                          <span className="truncate text-xs font-semibold text-muted">
                            {option.description}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  )
                })
              )}
            </ul>
          </div>,
          document.body,
        )
      : null

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} ref={rootRef}>
      <span className="flex items-center justify-between gap-2 ps-1.5">
        <Text as="label" variant="label" className="m-0" htmlFor={fieldId}>
          {label}
        </Text>
        {badge}
      </span>

      <button
        ref={triggerRef}
        type="button"
        id={fieldId}
        name={name}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => {
          if (!disabled) setOpen((v) => !v)
        }}
        onKeyDown={onTriggerKeyDown}
        className={[
          'flex h-14 w-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-[18px] text-start text-[15px] text-ink',
          'outline-none focus:border-cta focus:ring-2 focus:ring-cta/20',
          'font-semibold disabled:cursor-not-allowed disabled:opacity-55',
          open ? 'border-cta ring-2 ring-cta/20' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span className={selected || value ? 'text-ink' : 'text-muted'}>
          {selected ? (
            <>
              <span className="font-extrabold tracking-wide">
                {selected.label}
              </span>
              {selected.description ? (
                <span className="ms-2 font-semibold text-sub">
                  {selected.description}
                </span>
              ) : null}
            </>
          ) : value ? (
            <span className="font-extrabold tracking-wide">{value}</span>
          ) : (
            placeholder
          )}
        </span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden
          className={`size-4 shrink-0 text-muted transition ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {menu}

      {hint ? (
        <Text as="span" variant="caption" className="ps-1.5 text-muted">
          {hint}
        </Text>
      ) : null}
      {error ? (
        <Text as="span" variant="caption" className="ps-1.5 text-error">
          {error}
        </Text>
      ) : null}
    </div>
  )
}
