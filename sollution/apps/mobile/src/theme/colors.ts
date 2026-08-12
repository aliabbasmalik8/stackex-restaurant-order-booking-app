import { brand } from './brand';
import { palettes, PALETTE_IDS, type PaletteId, type PaletteTokens } from './palettes';

/**
 * Active palette tokens + semantic aliases for UI.
 * Prefer `colors` / `useTheme()` in components; re-skin via `brand.paletteId`
 * or preview overrides (`applyPalette`).
 */
export function buildColors(paletteId: PaletteId) {
  const active: PaletteTokens = palettes[paletteId];
  return {
    ...active,

    // Semantic aliases (stable names for components)
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
  } as const;
}

export type Colors = ReturnType<typeof buildColors>;

export function isPaletteId(value: unknown): value is PaletteId {
  return typeof value === 'string' && (PALETTE_IDS as string[]).includes(value);
}

type Listener = () => void;

let activePaletteId: PaletteId = brand.paletteId;
let activeColors: Colors = buildColors(activePaletteId);
const listeners = new Set<Listener>();

export function getActivePaletteId(): PaletteId {
  return activePaletteId;
}

export function getColors(): Colors {
  return activeColors;
}

export function subscribePalette(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Swap the live palette. No-op if the id is unknown or already active. */
export function applyPalette(paletteId: PaletteId): void {
  if (!isPaletteId(paletteId) || paletteId === activePaletteId) return;
  activePaletteId = paletteId;
  activeColors = buildColors(paletteId);
  listeners.forEach((listener) => listener());
}

/**
 * Live-reading token map. Safe in render after `useTheme()`.
 * Do not snapshot this into module-level `StyleSheet.create` — use `createStyles`.
 */
export const colors: Colors = new Proxy({} as Colors, {
  get(_target, prop) {
    return Reflect.get(activeColors, prop);
  },
}) as Colors;
