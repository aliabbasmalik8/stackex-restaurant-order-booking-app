import type { ReactNode } from 'react'

export type NavItem = {
  /** Stable id — used for keys and collapsed tooltips */
  id: string
  /** Absolute path under HashRouter */
  to: string
  /** i18n key under `nav.*` */
  labelKey: string
  /** Small inline icon (collapsed + expanded) */
  icon: ReactNode
}

/** Add future sidebar entries here — layout reads this list. */
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'orders',
    to: '/orders',
    labelKey: 'nav.orders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
        <path
          d="M7 7h10M7 12h10M7 17h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },
]
