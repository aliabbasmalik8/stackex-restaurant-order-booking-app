import { brand } from './brand'
import {
  isPaletteId,
  palettes,
  type PaletteId,
  type PaletteTokens,
} from './palettes'

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

type Listener = () => void

let activePaletteId: PaletteId = brand.paletteId
const listeners = new Set<Listener>()

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

export function getActivePaletteId(): PaletteId {
  return activePaletteId
}

export function subscribePalette(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Apply palette CSS variables. Call at boot and when the palette changes. */
export function applyTheme(paletteId: PaletteId = brand.paletteId) {
  if (!isPaletteId(paletteId)) return
  writePaletteVars(palettes[paletteId])
  document.documentElement.dataset.palette = paletteId
  if (paletteId === activePaletteId) return
  activePaletteId = paletteId
  listeners.forEach((listener) => listener())
}

/** Swap the live palette. No-op if the id is unknown or already active. */
export function applyPalette(paletteId: PaletteId): void {
  if (!isPaletteId(paletteId) || paletteId === activePaletteId) return
  applyTheme(paletteId)
}
