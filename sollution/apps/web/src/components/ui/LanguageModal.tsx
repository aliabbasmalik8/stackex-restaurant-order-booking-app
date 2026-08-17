import { useTranslation } from 'react-i18next'
import { LOCALE_META, type AppLocale } from '@/i18n'
import { useLanguage } from '@/i18n/LanguageContext'
import { Text } from './Text'

export function LanguageModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const { locale, setLocale } = useLanguage()

  if (!open) return null

  const pick = async (next: AppLocale) => {
    await setLocale(next)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[22px] bg-card p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="lang-title"
      >
        <Text as="h2" variant="title" id="lang-title" className="mb-1">
          {t('languages.title')}
        </Text>
        <Text variant="subtitle" className="mb-5 text-sub">
          {t('languages.subtitle')}
        </Text>
        <div className="flex flex-col gap-2">
          {(['en', 'ar'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => void pick(id)}
              className={[
                'flex h-12 items-center justify-between rounded-lg px-4 text-[14px] font-extrabold',
                locale === id
                  ? 'bg-sel text-sel-text'
                  : 'bg-surface text-ink hover:bg-divider',
              ].join(' ')}
            >
              <span>{t(LOCALE_META[id].nativeKey)}</span>
              {locale === id ? <span aria-hidden>✓</span> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
