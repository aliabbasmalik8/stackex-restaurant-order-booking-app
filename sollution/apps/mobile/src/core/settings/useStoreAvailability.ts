import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/i18n/LanguageContext';
import { useSettings } from './SettingsProvider';

/** Store open/closed + localized closed message for guest UI. */
export function useStoreAvailability() {
  const { storeStatus } = useSettings();
  const { locale } = useLanguage();
  const { t } = useTranslation();

  const isOpen = storeStatus.isAvailable;
  const closedMessage = (() => {
    if (isOpen) return '';
    const localized =
      locale === 'ar'
        ? storeStatus.closedMessageArabic || storeStatus.closedMessage
        : storeStatus.closedMessage || storeStatus.closedMessageArabic;
    return localized.trim() || t('store.closedDefault');
  })();

  return {
    isOpen,
    isClosed: !isOpen,
    closedMessage,
  };
}
