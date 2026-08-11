/**
 * Country dial presets — pick region; code + flag are derived.
 * `region` is ISO 3166-1 alpha-2 (stored on dial.region).
 */
export type DialCountryOption = {
  region: string
  code: string
  flag: string
  name: string
}

export const DIAL_COUNTRIES: readonly DialCountryOption[] = [
  { region: 'AE', code: '+971', flag: '🇦🇪', name: 'United Arab Emirates' },
  { region: 'SA', code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { region: 'QA', code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { region: 'KW', code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { region: 'BH', code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { region: 'OM', code: '+968', flag: '🇴🇲', name: 'Oman' },
  { region: 'EG', code: '+20', flag: '🇪🇬', name: 'Egypt' },
  { region: 'JO', code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { region: 'LB', code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { region: 'IQ', code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { region: 'SY', code: '+963', flag: '🇸🇾', name: 'Syria' },
  { region: 'PS', code: '+970', flag: '🇵🇸', name: 'Palestine' },
  { region: 'YE', code: '+967', flag: '🇾🇪', name: 'Yemen' },
  { region: 'US', code: '+1', flag: '🇺🇸', name: 'United States' },
  { region: 'CA', code: '+1', flag: '🇨🇦', name: 'Canada' },
  { region: 'GB', code: '+44', flag: '🇬🇧', name: 'United Kingdom' },
  { region: 'IE', code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { region: 'FR', code: '+33', flag: '🇫🇷', name: 'France' },
  { region: 'DE', code: '+49', flag: '🇩🇪', name: 'Germany' },
  { region: 'IT', code: '+39', flag: '🇮🇹', name: 'Italy' },
  { region: 'ES', code: '+34', flag: '🇪🇸', name: 'Spain' },
  { region: 'PT', code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { region: 'NL', code: '+31', flag: '🇳🇱', name: 'Netherlands' },
  { region: 'BE', code: '+32', flag: '🇧🇪', name: 'Belgium' },
  { region: 'CH', code: '+41', flag: '🇨🇭', name: 'Switzerland' },
  { region: 'AT', code: '+43', flag: '🇦🇹', name: 'Austria' },
  { region: 'SE', code: '+46', flag: '🇸🇪', name: 'Sweden' },
  { region: 'NO', code: '+47', flag: '🇳🇴', name: 'Norway' },
  { region: 'DK', code: '+45', flag: '🇩🇰', name: 'Denmark' },
  { region: 'FI', code: '+358', flag: '🇫🇮', name: 'Finland' },
  { region: 'PL', code: '+48', flag: '🇵🇱', name: 'Poland' },
  { region: 'TR', code: '+90', flag: '🇹🇷', name: 'Turkey' },
  { region: 'GR', code: '+30', flag: '🇬🇷', name: 'Greece' },
  { region: 'RU', code: '+7', flag: '🇷🇺', name: 'Russia' },
  { region: 'UA', code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { region: 'IN', code: '+91', flag: '🇮🇳', name: 'India' },
  { region: 'PK', code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { region: 'BD', code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { region: 'LK', code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { region: 'CN', code: '+86', flag: '🇨🇳', name: 'China' },
  { region: 'HK', code: '+852', flag: '🇭🇰', name: 'Hong Kong' },
  { region: 'JP', code: '+81', flag: '🇯🇵', name: 'Japan' },
  { region: 'KR', code: '+82', flag: '🇰🇷', name: 'South Korea' },
  { region: 'SG', code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { region: 'MY', code: '+60', flag: '🇲🇾', name: 'Malaysia' },
  { region: 'ID', code: '+62', flag: '🇮🇩', name: 'Indonesia' },
  { region: 'TH', code: '+66', flag: '🇹🇭', name: 'Thailand' },
  { region: 'PH', code: '+63', flag: '🇵🇭', name: 'Philippines' },
  { region: 'VN', code: '+84', flag: '🇻🇳', name: 'Vietnam' },
  { region: 'AU', code: '+61', flag: '🇦🇺', name: 'Australia' },
  { region: 'NZ', code: '+64', flag: '🇳🇿', name: 'New Zealand' },
  { region: 'ZA', code: '+27', flag: '🇿🇦', name: 'South Africa' },
  { region: 'NG', code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { region: 'KE', code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { region: 'GH', code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { region: 'MA', code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { region: 'TN', code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { region: 'DZ', code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { region: 'BR', code: '+55', flag: '🇧🇷', name: 'Brazil' },
  { region: 'MX', code: '+52', flag: '🇲🇽', name: 'Mexico' },
  { region: 'AR', code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { region: 'CL', code: '+56', flag: '🇨🇱', name: 'Chile' },
  { region: 'CO', code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { region: 'PE', code: '+51', flag: '🇵🇪', name: 'Peru' },
  { region: 'IL', code: '+972', flag: '🇮🇱', name: 'Israel' },
] as const

export function findDialCountry(
  region: string,
): DialCountryOption | undefined {
  const normalized = region.trim().toUpperCase()
  return DIAL_COUNTRIES.find((c) => c.region === normalized)
}

export function dialFromRegion(region: string): {
  code: string
  region: string
  flag: string
} | null {
  const match = findDialCountry(region)
  if (!match) return null
  return {
    code: match.code,
    region: match.region,
    flag: match.flag,
  }
}
