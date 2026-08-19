function parseFlag(raw: string | undefined): boolean {
  const value = raw?.trim().toLowerCase()
  return value === '1' || value === 'true' || value === 'yes'
}

export function isPreviewMode(): boolean {
  return parseFlag(import.meta.env.VITE_PREVIEW_MODE)
}
