import type { TranslationSchema } from './en'

export const ar: TranslationSchema = {
  common: {
    loading: 'جاري التحميل…',
    retry: 'أعد المحاولة',
    close: 'إغلاق',
    save: 'حفظ',
    cancel: 'إلغاء',
  },
  languages: {
    title: 'اللغة',
    en: 'الإنجليزية',
    ar: 'العربية',
    enNative: 'English',
    arNative: 'العربية',
  },
  auth: {
    signInTitle: 'تسجيل الدخول',
    signInSubtitle: 'استخدم حساب مسؤول لفتح لوحة التحكم.',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    signOut: 'تسجيل الخروج',
    errors: {
      missing_fields: 'أدخل البريد الإلكتروني وكلمة المرور.',
      invalid_credential: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
      invalid_email: 'أدخل بريداً إلكترونياً صالحاً.',
      too_many_requests: 'محاولات كثيرة. حاول مرة أخرى لاحقاً.',
      network: 'تحقق من اتصالك وحاول مرة أخرى.',
      config_missing:
        'لم يتم إعداد Firebase. أضف مفاتيح FIREBASE_* الستة إلى .env.',
      not_admin: 'هذا الحساب ليس حساب مسؤول.',
      unknown: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
    },
  },
  welcome: {
    title: 'مرحباً',
    body: 'أنت مسجّل الدخول إلى لوحة تحكم المسؤول.',
    cta: 'ابدأ',
  },
}
