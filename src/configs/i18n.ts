export const i18n = {
  defaultLocale: 'es',
  locales: ['es', 'en', 'fr', 'ar'],
  langDirection: {
    es: 'ltr',
    en: 'ltr',
    fr: 'ltr',
    ar: 'rtl'
  },
  // Configuración de cookie para idioma
  cookieName: 'locale',
  cookieMaxAge: 60 * 60 * 24 * 365 // 1 año
} as const

export type Locale = (typeof i18n)['locales'][number]
export type LangDirection = 'ltr' | 'rtl'
