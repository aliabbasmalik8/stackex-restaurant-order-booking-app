type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}

export const en = {
  common: {
    loading: 'Loading…',
    retry: 'Try again',
    refresh: 'Refresh',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
    emptyTitle: 'Nothing here yet',
  },
  nav: {
    main: 'Main',
    menu: 'Open menu',
    collapse: 'Collapse',
    expand: 'Expand',
    orders: 'Orders',
  },
  languages: {
    title: 'Language',
    en: 'English',
    ar: 'Arabic',
    enNative: 'English',
    arNative: 'العربية',
  },
  auth: {
    signInTitle: 'Sign in',
    signInSubtitle: 'Use an admin account to open the dashboard.',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign in',
    signOut: 'Sign out',
    errors: {
      missing_fields: 'Enter email and password.',
      invalid_credential: 'Wrong email or password.',
      invalid_email: 'Enter a valid email address.',
      too_many_requests: 'Too many attempts. Try again shortly.',
      network: 'Check your connection and try again.',
      config_missing:
        'Firebase is not configured. Add the six FIREBASE_* keys to .env.',
      not_admin: 'This account is not an admin.',
      unknown: 'Something went wrong. Please try again.',
    },
  },
  orders: {
    title: 'Orders',
    subtitle: 'All pickup orders across customers.',
    emptyTitle: 'No orders yet',
    emptyBody: 'Orders placed in the guest app will show up here.',
    items: 'items',
    columns: {
      code: 'Order',
      customer: 'Customer',
      status: 'Status',
      branch: 'Branch',
      total: 'Total',
      created: 'Created',
    },
    status: {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
  },
} as const

export type TranslationSchema = DeepStringify<typeof en>
