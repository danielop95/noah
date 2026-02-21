'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

import { useRouter } from 'next/navigation'

import { i18n, type Locale } from '@configs/i18n'
import { getCurrentLocale, setLocaleCookie, isValidLocale } from '@/utils/localeDetection'

type LocaleContextType = {
  locale: Locale
  setLocale: (locale: Locale) => void
  direction: 'ltr' | 'rtl'
}

const LocaleContext = createContext<LocaleContextType | null>(null)

type LocaleProviderProps = {
  children: ReactNode
  initialLocale?: Locale
}

export const LocaleProvider = ({ children, initialLocale }: LocaleProviderProps) => {
  const router = useRouter()
  const [locale, setLocaleState] = useState<Locale>(initialLocale || i18n.defaultLocale)

  // Inicializar locale en el cliente
  useEffect(() => {
    if (!initialLocale) {
      const detectedLocale = getCurrentLocale()

      setLocaleState(detectedLocale)
    }
  }, [initialLocale])

  // Cambiar idioma
  const setLocale = useCallback(
    (newLocale: Locale) => {
      if (!isValidLocale(newLocale)) return

      setLocaleCookie(newLocale)
      setLocaleState(newLocale)

      // Recargar para aplicar nuevas traducciones
      router.refresh()
    },
    [router]
  )

  const direction = i18n.langDirection[locale] || 'ltr'

  return <LocaleContext.Provider value={{ locale, setLocale, direction }}>{children}</LocaleContext.Provider>
}

/**
 * Hook para acceder al contexto de idioma
 */
export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext)

  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }

  return context
}

/**
 * Hook para obtener solo el locale actual (sin setter)
 */
export const useCurrentLocale = (): Locale => {
  const { locale } = useLocale()

  return locale
}
