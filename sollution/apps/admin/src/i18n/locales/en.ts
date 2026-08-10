type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}

export const en = {
  common: {
    loading: 'Loading…',
    retry: 'Try again',
    close: 'Close',
    save: 'Save',
    cancel: 'Cancel',
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
  welcome: {
    title: 'Welcome',
    body: 'You are signed in to the admin dashboard.',
    cta: 'Get started',
  },
} as const

export type TranslationSchema = DeepStringify<typeof en>
