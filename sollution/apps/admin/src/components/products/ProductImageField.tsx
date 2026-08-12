import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { isPublicPreviewMode } from '@/lib/previewMode'
import {
  canUploadProductImage,
  uploadProductImage,
} from '@/features/firebase-storage'
import { Button, NoticeModal, Text } from '@/components/ui'

type Props = {
  imageUrl: string
  onUrlChange: (url: string) => void
}

type PendingImage = {
  file: File
  previewUrl: string
}

/**
 * Product media: preview + optional Firebase upload (select → save) + manual URL.
 * Upload runs only when the user confirms Save on a pending selection.
 * Public preview mode blocks upload and shows a notice modal.
 */
export function ProductImageField({ imageUrl, onUrlChange }: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingPreviewRef = useRef<string | null>(null)
  const [pending, setPending] = useState<PendingImage | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [previewBroken, setPreviewBroken] = useState(false)
  const [previewNoticeOpen, setPreviewNoticeOpen] = useState(false)
  const uploadEnabled = canUploadProductImage()
  const previewMode = isPublicPreviewMode()
  const hasPending = pending !== null

  const previewSrc = hasPending
    ? pending.previewUrl
    : imageUrl.trim() && !previewBroken
      ? imageUrl.trim()
      : null

  const clearPending = useCallback(() => {
    if (pendingPreviewRef.current) {
      URL.revokeObjectURL(pendingPreviewRef.current)
      pendingPreviewRef.current = null
    }
    setPending(null)
    setUploadError(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  useEffect(() => {
    return () => {
      if (pendingPreviewRef.current) {
        URL.revokeObjectURL(pendingPreviewRef.current)
        pendingPreviewRef.current = null
      }
    }
  }, [])

  const onSelectClick = useCallback(() => {
    if (previewMode) {
      setPreviewNoticeOpen(true)
      return
    }
    inputRef.current?.click()
  }, [previewMode])

  const onSelectFile = useCallback(
    (file: File | undefined) => {
      if (!file || !uploadEnabled || uploading || previewMode) return
      setUploadError(null)
      setPreviewBroken(false)
      if (pendingPreviewRef.current) {
        URL.revokeObjectURL(pendingPreviewRef.current)
      }
      const previewUrl = URL.createObjectURL(file)
      pendingPreviewRef.current = previewUrl
      setPending({ file, previewUrl })
      if (inputRef.current) inputRef.current.value = ''
    },
    [uploadEnabled, uploading, previewMode],
  )

  const onSavePending = useCallback(async () => {
    if (!pending || !uploadEnabled || uploading || previewMode) return
    setUploadError(null)
    setUploading(true)
    try {
      const result = await uploadProductImage(pending.file)
      setPreviewBroken(false)
      onUrlChange(result.url)
      clearPending()
    } catch (error) {
      setUploadError(getErrorMessage(error, t('errors.uploadImageFailed')))
    } finally {
      setUploading(false)
    }
  }, [
    pending,
    uploadEnabled,
    uploading,
    previewMode,
    onUrlChange,
    clearPending,
    t,
  ])

  return (
    <div className="sm:col-span-2 flex flex-col gap-2">
      <Text as="span" variant="label" className="ps-1.5">
        {t('products.form.productImage')}
      </Text>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={[
            'relative flex h-36 w-full shrink-0 overflow-hidden rounded-xl',
            'bg-surface ring-1 ring-border sm:h-40 sm:w-40',
            hasPending ? 'ring-2 ring-cta/40' : '',
          ].join(' ')}
        >
          {previewSrc ? (
            <img
              src={previewSrc}
              alt=""
              className="h-full w-full object-cover"
              onError={() => {
                if (!hasPending) setPreviewBroken(true)
              }}
              onLoad={() => {
                if (!hasPending) setPreviewBroken(false)
              }}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-3 text-center">
              <Text variant="caption" className="text-muted">
                {imageUrl.trim()
                  ? t('products.form.imagePreviewBroken')
                  : t('products.form.imagePreviewEmpty')}
              </Text>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {uploadEnabled ? (
            <div className="flex flex-col gap-2">
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploading || previewMode}
                onChange={(e) => onSelectFile(e.target.files?.[0])}
              />

              {!hasPending ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={uploading}
                    className="h-11 px-5"
                    label={t('products.form.selectImage')}
                    onClick={onSelectClick}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    loading={uploading}
                    disabled={previewMode}
                    className="h-11 px-5"
                    label={
                      uploading
                        ? t('products.form.uploading')
                        : t('products.form.saveImage')
                    }
                    onClick={() => void onSavePending()}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={uploading}
                    className="h-11 px-4"
                    label={t('products.form.clearImage')}
                    onClick={clearPending}
                  />
                </div>
              )}

              <Text variant="caption" className="text-muted">
                {previewMode
                  ? t('products.form.imageUploadPreviewHint')
                  : hasPending
                    ? t('products.form.imagePendingHint')
                    : t('products.form.imageUploadHint')}
              </Text>
              {uploadError ? (
                <Text as="span" variant="caption" className="text-error">
                  {uploadError}
                </Text>
              ) : null}
            </div>
          ) : null}

          <label className="flex flex-col gap-1.5">
            <Text as="span" variant="label" className="ps-1.5">
              {t('products.form.image')}
            </Text>
            <input
              className={[
                'h-12 rounded-lg border border-border bg-card px-4 text-[15px] text-ink',
                'placeholder:text-muted outline-none',
                'focus:border-cta focus:ring-2 focus:ring-cta/20',
                'font-semibold',
                hasPending || uploading ? 'opacity-55' : '',
              ].join(' ')}
              value={imageUrl}
              disabled={hasPending || uploading}
              onChange={(e) => {
                setPreviewBroken(false)
                onUrlChange(e.target.value)
              }}
              placeholder="https://…"
            />
            <Text as="span" variant="caption" className="ps-1.5 text-muted">
              {hasPending
                ? t('products.form.imageUrlLockedHint')
                : uploadEnabled
                  ? t('products.form.imageUrlHintWithUpload')
                  : t('products.form.imageUrlHint')}
            </Text>
          </label>
        </div>
      </div>

      <NoticeModal
        open={previewNoticeOpen}
        title={t('products.form.imageUploadPreviewTitle')}
        body={t('products.form.imageUploadPreviewBody')}
        confirmLabel={t('common.close')}
        onClose={() => setPreviewNoticeOpen(false)}
      />
    </div>
  )
}
