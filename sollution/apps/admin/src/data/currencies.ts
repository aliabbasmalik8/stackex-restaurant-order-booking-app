/**
 * Common ISO 4217 currencies for admin commerce settings.
 * `code` is stored lowercase; `label` is the default display string.
 */
export type CurrencyOption = {
  code: string
  label: string
  name: string
}

export const CURRENCIES: readonly CurrencyOption[] = [
  { code: 'aed', label: 'AED', name: 'UAE Dirham' },
  { code: 'sar', label: 'SAR', name: 'Saudi Riyal' },
  { code: 'qar', label: 'QAR', name: 'Qatari Riyal' },
  { code: 'kwd', label: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'bhd', label: 'BHD', name: 'Bahraini Dinar' },
  { code: 'omr', label: 'OMR', name: 'Omani Rial' },
  { code: 'egp', label: 'EGP', name: 'Egyptian Pound' },
  { code: 'jod', label: 'JOD', name: 'Jordanian Dinar' },
  { code: 'usd', label: 'USD', name: 'US Dollar' },
  { code: 'eur', label: 'EUR', name: 'Euro' },
  { code: 'gbp', label: 'GBP', name: 'British Pound' },
  { code: 'chf', label: 'CHF', name: 'Swiss Franc' },
  { code: 'cad', label: 'CAD', name: 'Canadian Dollar' },
  { code: 'aud', label: 'AUD', name: 'Australian Dollar' },
  { code: 'nzd', label: 'NZD', name: 'New Zealand Dollar' },
  { code: 'jpy', label: 'JPY', name: 'Japanese Yen' },
  { code: 'cny', label: 'CNY', name: 'Chinese Yuan' },
  { code: 'hkd', label: 'HKD', name: 'Hong Kong Dollar' },
  { code: 'sgd', label: 'SGD', name: 'Singapore Dollar' },
  { code: 'inr', label: 'INR', name: 'Indian Rupee' },
  { code: 'pkr', label: 'PKR', name: 'Pakistani Rupee' },
  { code: 'bdt', label: 'BDT', name: 'Bangladeshi Taka' },
  { code: 'lkr', label: 'LKR', name: 'Sri Lankan Rupee' },
  { code: 'try', label: 'TRY', name: 'Turkish Lira' },
  { code: 'rub', label: 'RUB', name: 'Russian Ruble' },
  { code: 'uah', label: 'UAH', name: 'Ukrainian Hryvnia' },
  { code: 'pln', label: 'PLN', name: 'Polish Zloty' },
  { code: 'czk', label: 'CZK', name: 'Czech Koruna' },
  { code: 'sek', label: 'SEK', name: 'Swedish Krona' },
  { code: 'nok', label: 'NOK', name: 'Norwegian Krone' },
  { code: 'dkk', label: 'DKK', name: 'Danish Krone' },
  { code: 'huf', label: 'HUF', name: 'Hungarian Forint' },
  { code: 'ron', label: 'RON', name: 'Romanian Leu' },
  { code: 'bgn', label: 'BGN', name: 'Bulgarian Lev' },
  { code: 'hrk', label: 'HRK', name: 'Croatian Kuna' },
  { code: 'ils', label: 'ILS', name: 'Israeli Shekel' },
  { code: 'zar', label: 'ZAR', name: 'South African Rand' },
  { code: 'ngn', label: 'NGN', name: 'Nigerian Naira' },
  { code: 'kes', label: 'KES', name: 'Kenyan Shilling' },
  { code: 'ghs', label: 'GHS', name: 'Ghanaian Cedi' },
  { code: 'mad', label: 'MAD', name: 'Moroccan Dirham' },
  { code: 'tnd', label: 'TND', name: 'Tunisian Dinar' },
  { code: 'dzd', label: 'DZD', name: 'Algerian Dinar' },
  { code: 'brl', label: 'BRL', name: 'Brazilian Real' },
  { code: 'mxn', label: 'MXN', name: 'Mexican Peso' },
  { code: 'ars', label: 'ARS', name: 'Argentine Peso' },
  { code: 'clp', label: 'CLP', name: 'Chilean Peso' },
  { code: 'cop', label: 'COP', name: 'Colombian Peso' },
  { code: 'pen', label: 'PEN', name: 'Peruvian Sol' },
  { code: 'krw', label: 'KRW', name: 'South Korean Won' },
  { code: 'thb', label: 'THB', name: 'Thai Baht' },
  { code: 'myr', label: 'MYR', name: 'Malaysian Ringgit' },
  { code: 'idr', label: 'IDR', name: 'Indonesian Rupiah' },
  { code: 'php', label: 'PHP', name: 'Philippine Peso' },
  { code: 'vnd', label: 'VND', name: 'Vietnamese Dong' },
  { code: 'twd', label: 'TWD', name: 'New Taiwan Dollar' },
] as const

export function findCurrency(code: string): CurrencyOption | undefined {
  const normalized = code.trim().toLowerCase()
  return CURRENCIES.find((c) => c.code === normalized)
}

export function currencyDisplayFor(code: string): string {
  return findCurrency(code)?.label ?? code.trim().toUpperCase()
}
