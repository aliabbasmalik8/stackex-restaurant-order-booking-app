/**
 * Design palettes from Restaurant Ordering App.dc.html Tweaks panel.
 * Token names match the design doc 1:1 so screens map cleanly.
 */
export type PaletteId =
  | 'charcoal'
  | 'red'
  | 'dark'
  | 'emerald'
  | 'saffron'
  | 'midnight'
  | 'olive';

export type PaletteTokens = {
  pageBg: string;
  heroBg: string;
  sheetBg: string;
  cardBg: string;
  surface: string;
  divider: string;
  border: string;
  ink: string;
  sub: string;
  muted: string;
  link: string;
  price: string;
  ctaBg: string;
  ctaShadow: string;
  cardShadow: string;
  selBg: string;
  selText: string;
  badgeBg: string;
  badgeText: string;
  chipActiveBg: string;
  chipText: string;
  countBg: string;
  countText: string;
  checkBg: string;
  checkText: string;
  confCardBg: string;
  confCardText: string;
  placeholder: string;
  backBg: string;
  backText: string;
  /** Store-closed / caution banner */
  warningBg: string;
  warningBorder: string;
  warningText: string;
};

export const palettes: Record<PaletteId, PaletteTokens> = {
  charcoal: {
    pageBg: '#fdf6f1',
    heroBg: '#211d19',
    sheetBg: '#fdf6f1',
    cardBg: '#fff',
    surface: '#f2e2d8',
    divider: '#f0e3da',
    border: '#dcc9be',
    ink: '#26120e',
    sub: '#8f7266',
    muted: '#b09a90',
    link: '#c1352f',
    price: '#c1352f',
    ctaBg: '#c1352f',
    ctaShadow: 'rgba(193,53,47,.4)',
    cardShadow: 'rgba(38,18,14,.07)',
    selBg: '#26120e',
    selText: '#fdf6f1',
    badgeBg: '#c1352f',
    badgeText: '#fff',
    chipActiveBg: '#26120e',
    chipText: '#7a5f55',
    countBg: '#fff',
    countText: '#c1352f',
    checkBg: '#c1352f',
    checkText: '#fff',
    confCardBg: '#fdf6f1',
    confCardText: '#26120e',
    placeholder: '#e3d5cb',
    backBg: '#fff',
    backText: '#c1352f',
    warningBg: '#FEF3C7',
    warningBorder: '#F59E0B',
    warningText: '#92400E',
  },
  red: {
    pageBg: '#fdf6f1',
    heroBg: '#c1352f',
    sheetBg: '#fdf6f1',
    cardBg: '#fff',
    surface: '#f2e2d8',
    divider: '#f0e3da',
    border: '#dcc9be',
    ink: '#26120e',
    sub: '#8f7266',
    muted: '#b09a90',
    link: '#c1352f',
    price: '#26120e',
    ctaBg: '#211d19',
    ctaShadow: 'rgba(33,29,25,.4)',
    cardShadow: 'rgba(38,18,14,.07)',
    selBg: '#26120e',
    selText: '#fdf6f1',
    badgeBg: '#211d19',
    badgeText: '#fff',
    chipActiveBg: '#26120e',
    chipText: '#7a5f55',
    countBg: '#c1352f',
    countText: '#fff',
    checkBg: '#fff',
    checkText: '#c1352f',
    confCardBg: '#fdf6f1',
    confCardText: '#26120e',
    placeholder: '#e3d5cb',
    backBg: '#fff',
    backText: '#26120e',
    warningBg: '#FEF3C7',
    warningBorder: '#F59E0B',
    warningText: '#92400E',
  },
  dark: {
    pageBg: '#171411',
    heroBg: '#211d19',
    sheetBg: '#1d1a16',
    cardBg: '#241f1b',
    surface: '#2b2520',
    divider: '#2b2520',
    border: '#4a4139',
    ink: '#f4efe8',
    sub: '#9c9284',
    muted: '#8f867a',
    link: '#e05a4e',
    price: '#e05a4e',
    ctaBg: '#c1352f',
    ctaShadow: 'rgba(193,53,47,.35)',
    cardShadow: 'rgba(0,0,0,.35)',
    selBg: '#c1352f',
    selText: '#fff',
    badgeBg: '#c1352f',
    badgeText: '#fff',
    chipActiveBg: '#c1352f',
    chipText: '#b8ac9c',
    countBg: '#fff',
    countText: '#c1352f',
    checkBg: '#c1352f',
    checkText: '#fff',
    confCardBg: '#241f1b',
    confCardText: '#f4efe8',
    placeholder: '#3a332c',
    backBg: '#241f1b',
    backText: '#f4efe8',
    warningBg: '#3a2e14',
    warningBorder: '#c9a24b',
    warningText: '#f5d78c',
  },
  emerald: {
    pageBg: '#f7f5ef',
    heroBg: '#123d2e',
    sheetBg: '#f7f5ef',
    cardBg: '#fff',
    surface: '#e9e4d5',
    divider: '#ece7da',
    border: '#d3ccb8',
    ink: '#14211b',
    sub: '#6f7a6c',
    muted: '#9aa392',
    link: '#1d6a4c',
    price: '#1d6a4c',
    ctaBg: '#1d6a4c',
    ctaShadow: 'rgba(29,106,76,.38)',
    cardShadow: 'rgba(20,33,27,.07)',
    selBg: '#123d2e',
    selText: '#f7f5ef',
    badgeBg: '#c9a24b',
    badgeText: '#14211b',
    chipActiveBg: '#123d2e',
    chipText: '#6f7a6c',
    countBg: '#fff',
    countText: '#1d6a4c',
    checkBg: '#c9a24b',
    checkText: '#14211b',
    confCardBg: '#f7f5ef',
    confCardText: '#14211b',
    placeholder: '#dcd6c4',
    backBg: '#fff',
    backText: '#1d6a4c',
    warningBg: '#f4ead0',
    warningBorder: '#c9a24b',
    warningText: '#5c4a1a',
  },
  saffron: {
    pageBg: '#fffaf2',
    heroBg: '#d97b1e',
    sheetBg: '#fffaf2',
    cardBg: '#fff',
    surface: '#f7e8d2',
    divider: '#f3e6d2',
    border: '#e3cba4',
    ink: '#2b1c0e',
    sub: '#94724d',
    muted: '#bfa27d',
    link: '#c05f10',
    price: '#c05f10',
    ctaBg: '#2b1c0e',
    ctaShadow: 'rgba(43,28,14,.4)',
    cardShadow: 'rgba(43,28,14,.07)',
    selBg: '#2b1c0e',
    selText: '#fffaf2',
    badgeBg: '#2b1c0e',
    badgeText: '#fff',
    chipActiveBg: '#2b1c0e',
    chipText: '#94724d',
    countBg: '#d97b1e',
    countText: '#fff',
    checkBg: '#fff',
    checkText: '#c05f10',
    confCardBg: '#fffaf2',
    confCardText: '#2b1c0e',
    placeholder: '#eeddc2',
    backBg: '#fff',
    backText: '#2b1c0e',
    warningBg: '#FDE8C8',
    warningBorder: '#C05F10',
    warningText: '#7A3E08',
  },
  midnight: {
    pageBg: '#f5f6f8',
    heroBg: '#152238',
    sheetBg: '#f5f6f8',
    cardBg: '#fff',
    surface: '#e7eaef',
    divider: '#e9ecf1',
    border: '#c9d0da',
    ink: '#152238',
    sub: '#5d6b80',
    muted: '#93a0b2',
    link: '#c8912e',
    price: '#152238',
    ctaBg: '#c8912e',
    ctaShadow: 'rgba(200,145,46,.4)',
    cardShadow: 'rgba(21,34,56,.08)',
    selBg: '#152238',
    selText: '#fff',
    badgeBg: '#c8912e',
    badgeText: '#fff',
    chipActiveBg: '#152238',
    chipText: '#5d6b80',
    countBg: '#fff',
    countText: '#152238',
    checkBg: '#c8912e',
    checkText: '#fff',
    confCardBg: '#fff',
    confCardText: '#152238',
    placeholder: '#dde2e9',
    backBg: '#fff',
    backText: '#152238',
    warningBg: '#FEF3C7',
    warningBorder: '#F59E0B',
    warningText: '#92400E',
  },
  olive: {
    pageBg: '#faf8f3',
    heroBg: '#4a4a33',
    sheetBg: '#faf8f3',
    cardBg: '#fff',
    surface: '#edeadb',
    divider: '#eeebdd',
    border: '#d5d1ba',
    ink: '#2b2b1e',
    sub: '#82806a',
    muted: '#a8a690',
    link: '#8a6a2f',
    price: '#5b5b3c',
    ctaBg: '#5b5b3c',
    ctaShadow: 'rgba(91,91,60,.38)',
    cardShadow: 'rgba(43,43,30,.07)',
    selBg: '#4a4a33',
    selText: '#faf8f3',
    badgeBg: '#8a6a2f',
    badgeText: '#fff',
    chipActiveBg: '#4a4a33',
    chipText: '#82806a',
    countBg: '#fff',
    countText: '#5b5b3c',
    checkBg: '#fff',
    checkText: '#5b5b3c',
    confCardBg: '#faf8f3',
    confCardText: '#2b2b1e',
    placeholder: '#e0dcc8',
    backBg: '#fff',
    backText: '#5b5b3c',
    warningBg: '#FEF3C7',
    warningBorder: '#F59E0B',
    warningText: '#92400E',
  },
};

export const PALETTE_IDS = Object.keys(palettes) as PaletteId[];

/** Soft grouping for the preview picker — accent families, not light/dark modes. */
export const PALETTE_GROUPS: readonly {
  id: 'warm' | 'cool' | 'earth' | 'darkUi';
  ids: readonly PaletteId[];
}[] = [
  { id: 'warm', ids: ['charcoal', 'red', 'saffron'] },
  { id: 'cool', ids: ['midnight', 'emerald'] },
  { id: 'earth', ids: ['olive'] },
  { id: 'darkUi', ids: ['dark'] },
];
