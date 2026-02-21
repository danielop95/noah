import 'server-only'

import { cookies } from 'next/headers'

import { i18n, type Locale } from '@configs/i18n'

const dictionaries = {
  es: () => import('@/data/dictionaries/es.json').then(module => module.default),
  en: () => import('@/data/dictionaries/en.json').then(module => module.default),
  fr: () => import('@/data/dictionaries/fr.json').then(module => module.default),
  ar: () => import('@/data/dictionaries/ar.json').then(module => module.default)
}

/**
 * Obtiene el diccionario para un idioma específico
 */
export const getDictionary = async (locale: Locale) => {
  const validLocale = i18n.locales.includes(locale) ? locale : i18n.defaultLocale

  return dictionaries[validLocale]()
}

/**
 * Obtiene el diccionario basado en la cookie de idioma (Server Components)
 */
export const getDictionaryFromCookie = async () => {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get(i18n.cookieName)
  const locale = (localeCookie?.value as Locale) || i18n.defaultLocale

  return getDictionary(locale)
}

/**
 * Obtiene el locale de la cookie (Server Components)
 */
export const getLocaleFromCookie = async (): Promise<Locale> => {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get(i18n.cookieName)
  const locale = localeCookie?.value

  if (locale && i18n.locales.includes(locale as Locale)) {
    return locale as Locale
  }

  return i18n.defaultLocale
}
