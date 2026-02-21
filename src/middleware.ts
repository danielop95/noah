// Next Imports
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Config Imports
import { i18n } from '@configs/i18n'

// Constants
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost'

// Rutas publicas (sin subdominio requerido)
const PUBLIC_PATHS = ['/', '/login', '/registrar-iglesia', '/forgot-password']

// Rutas que deben ignorarse completamente
const IGNORED_PATHS = ['/api', '/_next', '/favicon.ico', '/images', '/uploads']

/**
 * Extrae el slug del subdominio del hostname.
 * Ejemplo: "miglesia.noah.com" -> "miglesia"
 * Retorna null si no hay subdominio o es el dominio principal.
 */
const extractTenantSlug = (hostname: string): string | null => {
  // Eliminar el puerto si existe (ej: localhost:3000)
  const cleanHost = hostname.split(':')[0]

  // Si es localhost sin subdominio, no hay tenant
  if (cleanHost === 'localhost' || cleanHost === MAIN_DOMAIN) {
    return null
  }

  // Buscar subdominio: tenant.domain.com -> tenant
  const parts = cleanHost.split('.')

  // Manejo especial para dominios de Vercel
  if (cleanHost.endsWith('.vercel.app')) {
    // tenant.project.vercel.app -> 4 partes
    // project.vercel.app -> 3 partes (no hay tenant)
    if (parts.length <= 3) {
      return null
    }

    return parts[0] === 'www' ? null : parts[0]
  }

  // Necesitamos al menos 3 partes para un subdominio (tenant.domain.com)
  // O 2 partes si es tenant.localhost
  if (cleanHost.endsWith('.localhost') && parts.length >= 2) {
    return parts[0] === 'www' ? null : parts[0]
  }

  if (parts.length >= 3) {
    const subdomain = parts[0]

    // Ignorar subdominios del sistema
    if (['www', 'app', 'api', 'admin'].includes(subdomain)) {
      return null
    }

    return subdomain
  }

  return null
}

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
  const hostname = request.headers.get('host') || ''

  // Ignorar rutas estaticas y de API
  if (IGNORED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Detectar tenant por subdominio
  const tenantSlug = extractTenantSlug(hostname)

  // Obtener locale
  const locale = getLocale(request)

  // Preparar headers con tenant si existe
  const requestHeaders = new Headers(request.headers)

  if (tenantSlug) {
    requestHeaders.set('x-tenant-slug', tenantSlug)
  }

  // Verificar si es una ruta antigua con prefijo de idioma (ej: /es/login)
  const localeMatch = pathname.match(/^\/(es|en|fr|ar)(\/.*)?$/)

  if (localeMatch) {
    // Extraer la ruta sin el prefijo de idioma
    const pathWithoutLocale = localeMatch[2] || '/'

    // Redirigir a la nueva ruta sin prefijo de idioma
    const redirectUrl = new URL(pathWithoutLocale, request.url)

    return NextResponse.redirect(redirectUrl, { status: 301 })
  }

  // Crear respuesta base
  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })

  // Establecer cookie de idioma si no existe
  if (!request.cookies.get(i18n.cookieName)) {
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieDomain = isProduction ? `.${MAIN_DOMAIN}` : undefined

    response.cookies.set(i18n.cookieName, locale, {
      path: '/',
      maxAge: i18n.cookieMaxAge,
      sameSite: 'lax',
      ...(cookieDomain && { domain: cookieDomain })
    })
  }

  // Logica especifica segun si hay tenant o no
  if (tenantSlug) {
    // CON SUBDOMINIO (tenant)

    // Redirigir raiz al dashboard
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
  } else {
    // SIN SUBDOMINIO (dominio principal)

    // Verificar si es una ruta publica permitida
    const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(`${path}/`))

    // Si no es ruta publica, redirigir al login
    if (!isPublicPath && pathname !== '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  }
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, and static assets
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|uploads|next.svg|vercel.svg).*)']
}
