import { i18n, type Locale } from '@configs/i18n'
import { ensurePrefix } from '@/utils/string'

/**
 * Verifica si la URL tiene un prefijo de idioma (legado)
 */
export const isUrlMissingLocale = (url: string) => {
  return i18n.locales.every(locale => !(url.startsWith(`/${locale}/`) || url === `/${locale}`))
}

/**
 * Remueve el prefijo de idioma de una URL si existe
 */
export const removeLocalePrefix = (url: string): string => {
  for (const locale of i18n.locales) {
    if (url.startsWith(`/${locale}/`)) {
      return url.slice(locale.length + 1)
    }

    if (url === `/${locale}`) {
      return '/'
    }
  }

  return url
}

/**
 * Obtiene la URL (sin agregar prefijo de idioma)
 * Mantenemos esta función por compatibilidad pero ya no agrega /es/
 */
export const getLocalizedUrl = (url: string, _languageCode?: string): string => {
  if (!url) return '/'

  // Si la URL tiene un prefijo de idioma legado, removerlo
  const cleanUrl = removeLocalePrefix(url)

  return ensurePrefix(cleanUrl, '/')
}

/**
 * Valida si un código de idioma es válido
 */
export const isValidLocale = (locale: string | undefined | null): locale is Locale => {
  return !!locale && i18n.locales.includes(locale as Locale)
}
