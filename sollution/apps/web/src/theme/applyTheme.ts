import { brand } from './brand'
import { palettes, type PaletteId, type PaletteTokens } from './palettes'

const CSS_VAR_MAP: Record<keyof PaletteTokens, string> = {
  pageBg: '--page-bg',
  heroBg: '--hero-bg',
  sheetBg: '--sheet-bg',
  cardBg: '--card-bg',
  surface: '--surface',
  divider: '--divider',
  border: '--border',
  ink: '--ink',
  sub: '--sub',
  muted: '--muted',
  link: '--link',
  price: '--price',
  ctaBg: '--cta-bg',
  ctaShadow: '--cta-shadow',
  cardShadow: '--card-shadow',
  selBg: '--sel-bg',
  selText: '--sel-text',
  badgeBg: '--badge-bg',
  badgeText: '--badge-text',
  chipActiveBg: '--chip-active-bg',
  chipText: '--chip-text',
  countBg: '--count-bg',
  countText: '--count-text',
  checkBg: '--check-bg',
  checkText: '--check-text',
  confCardBg: '--conf-card-bg',
  confCardText: '--conf-card-text',
  placeholder: '--placeholder',
  backBg: '--back-bg',
  backText: '--back-text',
}

function writePaletteVars(
  tokens: PaletteTokens,
  target: HTMLElement = document.documentElement,
) {
  for (const [key, cssVar] of Object.entries(CSS_VAR_MAP) as [
    keyof PaletteTokens,
    string,
  ][]) {
    target.style.setProperty(cssVar, tokens[key])
  }

  target.style.setProperty('--on-primary', '#ffffff')
  target.style.setProperty('--on-hero', '#ffffff')
  target.style.setProperty('--error', '#ba1a1a')
  target.style.setProperty('--hero-glass', 'rgba(255,255,255,0.14)')
  target.style.setProperty('--hero-glass-border', 'rgba(255,255,255,0.22)')
}

export function applyTheme(paletteId: PaletteId = brand.paletteId) {
  writePaletteVars(palettes[paletteId])
  document.documentElement.dataset.palette = paletteId
}
