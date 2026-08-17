/** Admin `.env` flag — see `.docs/preview-mode.md`. Not a DB setting. */
export const PUBLIC_PREVIEW_MODE_ENV_KEY = 'VITE_IS_PUBLIC_PREVIEW_MODE'

function parseFlag(raw: string | undefined): boolean {
  const value = raw?.trim().toLowerCase()
  return value === '1' || value === 'true' || value === 'yes'
}

/** True when `VITE_IS_PUBLIC_PREVIEW_MODE` is set — store lock, image upload, location edit. */
export function isPublicPreviewMode(): boolean {
  return parseFlag(import.meta.env.VITE_IS_PUBLIC_PREVIEW_MODE)
}
