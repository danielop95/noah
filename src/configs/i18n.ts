export const i18n = {
  defaultLocale: 'es',
  locales: ['es'],
  langDirection: {
    es: 'ltr'
  }
} as const

export type Locale = (typeof i18n)['locales'][number]
