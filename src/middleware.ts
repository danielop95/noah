// Next Imports
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Config Imports
import { i18n } from '@configs/i18n'

// Rutas que deben ignorarse completamente
const IGNORED_PATHS = ['/api', '/_next', '/favicon.ico', '/images', '/uploads']

/**
 * Obtiene el idioma del navegador del usuario
 */
const getLocaleFromAcceptLanguage = (request: NextRequest): string => {
  const acceptLanguage = request.headers.get('accept-language')

  if (!acceptLanguage) {
    return i18n.defaultLocale
  }

  // Parsear Accept-Language header
  const languages = acceptLanguage.split(',').map(lang => {
    const [code] = lang.trim().split(';')

    return code.split('-')[0].toLowerCase()
  })

  // Buscar el primer idioma soportado
  for (const lang of languages) {
    if (i18n.locales.includes(lang as (typeof i18n.locales)[number])) {
      return lang
    }
  }

  return i18n.defaultLocale
}

/**
 * Obtiene el locale de la cookie o del navegador
 */
const getLocale = (request: NextRequest): string => {
  // Intentar obtener de la cookie
  const localeCookie = request.cookies.get(i18n.cookieName)

  if (localeCookie?.value && i18n.locales.includes(localeCookie.value as (typeof i18n.locales)[number])) {
    return localeCookie.value
  }

  // Detectar del navegador
  return getLocaleFromAcceptLanguage(request)
}

export const middleware = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname

  // Ignorar rutas estaticas y de API
  if (IGNORED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Obtener locale
  const locale = getLocale(request)

  // Verificar si es una ruta antigua con prefijo de idioma (ej: /es/login)
  const localeMatch = pathname.match(/^\/(es|en|fr|ar)(\/.*)?$/)

  if (localeMatch) {
    const pathWithoutLocale = localeMatch[2] || '/'
    const redirectUrl = new URL(pathWithoutLocale, request.url)

    return NextResponse.redirect(redirectUrl, { status: 301 })
  }

  // Redirigir raiz al dashboard (la pagina maneja auth)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Crear respuesta
  const response = NextResponse.next()

  // Establecer cookie de idioma si no existe
  if (!request.cookies.get(i18n.cookieName)) {
    response.cookies.set(i18n.cookieName, locale, {
      path: '/',
      maxAge: i18n.cookieMaxAge,
      sameSite: 'lax'
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|uploads|next.svg|vercel.svg).*)']
}
