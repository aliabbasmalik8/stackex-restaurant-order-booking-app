export const en = {
  common: {
    back: 'Go back',
    change: 'Change',
    edit: 'Edit',
    required: 'Required',
    optional: 'Optional',
    included: 'included',
    aed: 'AED',
    loading: 'Loading…',
    retry: 'Try again',
    close: 'Close',
    cancel: 'Cancel',
    delete: 'Delete',
    signIn: 'Sign in',
    items: '{{count}} items',
  },
  errors: {
    config_missing: {
      title: 'Menu unavailable',
      message:
        'We couldn’t connect to the restaurant right now. Please try again in a moment.',
    },
    network: {
      title: 'No connection',
      message: 'Check your internet and try again.',
    },
    permission: {
      title: 'Can’t load menu',
      message: 'Something went wrong on our side. Please try again shortly.',
    },
    not_found: {
      title: 'Not found',
      message: 'This item isn’t available anymore.',
    },
    empty: {
      title: 'Nothing here yet',
      message: 'The menu will show up once it’s ready.',
    },
    store_closed: {
      title: 'Store closed',
      message: 'We’re not taking orders right now. Please check back later.',
    },
    item_unavailable: {
      title: 'Item unavailable',
      message:
        'Some items in your cart are no longer available and were removed. Review your cart and try again.',
    },
    branch_unavailable: {
      title: 'Location unavailable',
      message:
        'This pickup location isn’t taking orders right now. Choose another branch or try again later.',
    },
    out_of_delivery_range: {
      title: 'Outside delivery area',
      message:
        'We don’t deliver to this address. Choose a pin closer to one of our kitchens.',
    },
    delivery_address_required: {
      title: 'Address needed',
      message: 'Add a delivery address before placing an order.',
    },
    unknown: {
      title: 'Something went wrong',
      message: 'Please try again. If it keeps happening, come back in a bit.',
    },
  },
  store: {
    closedDefault: 'We’re currently closed and not taking new orders.',
    closedCta: 'Closed',
    addUnavailable: 'Ordering unavailable',
  },
  languages: {
    title: 'Language',
    subtitle: 'Choose how the app speaks to you.',
    en: 'English',
    ar: 'Arabic',
    enNative: 'English',
    arNative: 'العربية',
    done: 'Done',
  },
  auth: {
    welcomeBack: 'Welcome back',
    signInSubtitle: 'Sign in with your email and password.',
    heroTitle: 'Order ahead. Skip the line.',
    heroBody:
      'Save your usual order, pay in two clicks, and get pinged the moment your food is ready.',
    heroEta: 'Ready in ~{{minutes}} min',
    heroPickup: 'Pickup · skip the counter queue',
    signIn: 'Sign in',
    continue: 'Continue',
    resendEmail: 'Resend email',
    orContinueWith: 'or continue with',
    apple: 'Apple',
    google: 'Google',
    newHere: 'New here?',
    createAccount: 'Create account',
    continueAsGuest: 'Continue as guest →',
    forgotPassword: 'Forgot password?',
    forgotPasswordTitle: 'Reset password',
    forgotPasswordSubtitle:
      'Enter your email and we’ll send a link to set a new password.',
    sendResetEmail: 'Send reset email',
    passwordPlaceholder: 'Password',
    password: 'Password',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Re-enter password',
    passwordMismatch: 'Passwords don’t match',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    signUpTitle: 'Create account',
    signUpSubtitle: 'Save your usual order and check out faster.',
    fullName: 'Full name',
    email: 'Email',
    namePlaceholder: 'Aisha Khalid',
    emailPlaceholder: 'aisha@example.com',
    whatsappOffers: 'Send me offers and new menu drops on WhatsApp',
    createAccountCta: 'Create account',
    termsPrefix: 'By continuing you agree to the ',
    terms: 'Terms',
    and: ' and ',
    privacy: 'Privacy Policy',
    passwordResetSent: 'Reset email sent — check inbox and spam.',
    alreadyHaveAccount: 'Already have an account?',
    errors: {
      invalid_credential: 'Email or password is incorrect.',
      account_not_exist: 'No account found for this email.',
      email_in_use: 'An account with this email already exists.',
      weak_password: 'Use a password with at least 6 characters.',
      invalid_email: 'Enter a valid email address.',
      too_many_requests: 'Too many attempts. Try again in a moment.',
      network: 'Check your internet and try again.',
      config_missing: 'Sign-in isn’t available right now. Try again later.',
      requires_recent_login: 'Sign in again to manage sign-in methods.',
      credential_in_use:
        'This Google account is already linked to a different user.',
      unknown: 'Something went wrong. Please try again.',
    },
  },
  menu: {
    pickup: 'Pickup',
    eta: '15 min',
    readyAround: 'Ready ~{{time}}',
    searchPlaceholder: 'Search the menu',
    navLabel: 'Menu',
    heroTitle: 'Fresh off the spit, ready in 15',
    heroSubtitle: 'Order ahead — skip the line at the counter.',
    itemCount: '{{count}} items',
    popular: 'Popular',
    addItem: 'Add {{name}}',
    categories: {
      all: 'All',
    },
  },
  cart: {
    title: 'Your order',
    empty: 'Your cart is empty. Add something tasty from the menu.',
    subtotal: 'Subtotal',
    vat: 'VAT 5%',
    total: 'Total',
    checkoutCta: 'Checkout · pick a time →',
    addPromo: 'Add promo code',
    apply: 'Apply',
  },
  nav: {
    orders: 'Orders',
    signIn: 'Sign in',
  },
  features: {
    previewUnavailable: 'Not available at the moment',
  },
} as const

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}

export type TranslationSchema = DeepStringify<typeof en>
