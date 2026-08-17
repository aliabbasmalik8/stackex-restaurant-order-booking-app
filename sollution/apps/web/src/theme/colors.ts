import { brand } from './brand'
import { palettes, type PaletteTokens } from './palettes'

const active: PaletteTokens = palettes[brand.paletteId]

export const colors = {
  ...active,
  background: active.pageBg,
  hero: active.heroBg,
  card: active.cardBg,
  text: active.ink,
  textSecondary: active.sub,
  textMuted: active.muted,
  primary: active.ctaBg,
  primaryShadow: active.ctaShadow,
  onPrimary: '#ffffff',
  onHero: '#ffffff',
  onHeroSoft: 'rgba(255,255,255,0.75)',
  onHeroMuted: 'rgba(255,255,255,0.55)',
  onHeroFaint: 'rgba(255,255,255,0.06)',
  heroGlass: 'rgba(255,255,255,0.14)',
  heroGlassBorder: 'rgba(255,255,255,0.22)',
  heroGlassFill: 'rgba(255,255,255,0.12)',
  heroRule: 'rgba(255,255,255,0.2)',
  error: '#ba1a1a',
} as const

export type Colors = typeof colors
