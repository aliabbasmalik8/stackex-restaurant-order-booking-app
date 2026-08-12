import type { ReactNode } from 'react'

export type NavItem = {
  /** Stable id — used for keys and collapsed tooltips */
  id: string
  /** Absolute path under BrowserRouter */
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
  {
    id: 'products',
    to: '/products',
    labelKey: 'nav.products',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
        <path
          d="M4.5 8.5 12 4l7.5 4.5v7L12 20l-7.5-4.5v-7Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M12 12v8M12 12 4.5 8.5M12 12l7.5-3.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'categories',
    to: '/categories',
    labelKey: 'nav.categories',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
        <path
          d="M4 7h16M4 12h16M4 17h10"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'branches',
    to: '/branches',
    labelKey: 'nav.branches',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
        <path
          d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    id: 'settings',
    to: '/settings',
    labelKey: 'nav.settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-5">
        <path
          d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M19.4 13.1c.05-.36.05-.74 0-1.1l1.7-1.3a.5.5 0 0 0 .12-.64l-1.6-2.8a.5.5 0 0 0-.6-.22l-2 .8a7.2 7.2 0 0 0-.95-.55l-.3-2.1a.5.5 0 0 0-.5-.42h-3.2a.5.5 0 0 0-.5.42l-.3 2.1c-.33.14-.65.33-.95.55l-2-.8a.5.5 0 0 0-.6.22L3.8 10.06a.5.5 0 0 0 .12.64l1.7 1.3c-.05.36-.05.74 0 1.1l-1.7 1.3a.5.5 0 0 0-.12.64l1.6 2.8c.13.23.4.32.6.22l2-.8c.3.22.62.41.95.55l.3 2.1c.05.24.26.42.5.42h3.2c.24 0 .45-.18.5-.42l.3-2.1c.33-.14.65-.33.95-.55l2 .8c.22.1.47 0 .6-.22l1.6-2.8a.5.5 0 0 0-.12-.64l-1.7-1.3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
]
