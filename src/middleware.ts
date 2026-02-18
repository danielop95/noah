// Next Imports
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { ensurePrefix } from '@/utils/string'

// Constants
const MAIN_DOMAIN = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'localhost'

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

const getLocale = (request: NextRequest): string => {
  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales

  // Try to get locale from cookie
  const localeCookie = request.cookies.get('locale')

  if (localeCookie?.value && locales.includes(localeCookie.value)) {
    return localeCookie.value
  }

  // Always return default locale if no valid cookie is found
  return i18n.defaultLocale
}

export const middleware = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname
  const hostname = request.headers.get('host') || ''

  // Detectar tenant por subdominio
  const tenantSlug = extractTenantSlug(hostname)

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    locale => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    const redirectUrl = new URL(`/${locale}${ensurePrefix(pathname, '/')}`, request.url)
    const response = NextResponse.redirect(redirectUrl)

    // Establecer cookie de idioma si no existe (usuarios nuevos)
    const localeCookie = request.cookies.get('locale')

    if (!localeCookie) {
      response.cookies.set('locale', locale, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 año
        sameSite: 'lax'
      })
    }

    return response
  }

  // Si hay tenant, agregar header para que la app lo pueda leer
  if (tenantSlug) {
    const requestHeaders = new Headers(request.headers)

    requestHeaders.set('x-tenant-slug', tenantSlug)

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    })
  }

  // Si NO hay tenant (dominio principal), redirigir /login a /landing
  const locale = getLocale(request)
  const loginPattern = new RegExp(`^/(${i18n.locales.join('|')})/login/?$`)

  if (loginPattern.test(pathname)) {
    const redirectUrl = new URL(pathname.replace('/login', '/landing'), request.url)

    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|next.svg|vercel.svg).*)']
}
