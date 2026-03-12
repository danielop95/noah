import { i18n, type Locale } from '@configs/i18n'
import { isValidLocale } from '@/utils/i18n'

// Re-exportar isValidLocale desde la fuente canónica
export { isValidLocale }

/**
 * Detecta el idioma del navegador (client-side)
 */
export const getLocaleFromBrowser = (): Locale => {
  if (typeof window === 'undefined') {
    return i18n.defaultLocale
  }

  // Obtener idiomas preferidos del navegador
  const browserLocales = navigator.languages || [navigator.language]

  for (const browserLocale of browserLocales) {
    // Extraer código de idioma base (ej: 'es-MX' -> 'es')
    const langCode = browserLocale.split('-')[0].toLowerCase()

    if (i18n.locales.includes(langCode as Locale)) {
      return langCode as Locale
    }
  }

  return i18n.defaultLocale
}

/**
 * Obtiene el idioma de la cookie (client-side)
 */
export const getLocaleFromCookie = (): Locale | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const cookies = document.cookie.split(';')
  const localeCookie = cookies.find(c => c.trim().startsWith(`${i18n.cookieName}=`))

  if (localeCookie) {
    const value = localeCookie.split('=')[1]?.trim()

    if (value && i18n.locales.includes(value as Locale)) {
      return value as Locale
    }
  }

  return null
}

/**
 * Guarda el idioma en cookie (client-side)
 */
export const setLocaleCookie = (locale: Locale): void => {
  if (typeof document === 'undefined') return

  document.cookie = `${i18n.cookieName}=${locale}; path=/; max-age=${i18n.cookieMaxAge}; SameSite=Lax`
}

/**
 * Obtiene el idioma actual (cookie > navegador > default)
 */
export const getCurrentLocale = (): Locale => {
  const cookieLocale = getLocaleFromCookie()

  if (cookieLocale) {
    return cookieLocale
  }

  const browserLocale = getLocaleFromBrowser()

  // Guardar en cookie para futuras visitas
  setLocaleCookie(browserLocale)

  return browserLocale
}

