// Next Imports
import { headers } from 'next/headers'
import { Outfit } from 'next/font/google'

// MUI Imports
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'

// Component Imports
import Providers from '@components/Providers'

// Service Imports
import { getOrganizationBySlug, type TenantBranding, type TenantColors } from '@/services/organizationService'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getSystemMode } from '@core/utils/serverHelpers'
import { getLocaleFromCookie } from '@/utils/getDictionary'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit'
})

export const metadata = {
  title: 'Noah - Software de Gestion para Iglesias',
  description: 'Noah es la plataforma B2B SaaS lider para la gestion integral de iglesias modernas.'
}

const RootLayout = async ({ children }: ChildrenType) => {
  const locale = await getLocaleFromCookie()
  const direction = i18n.langDirection[locale]
  const systemMode = await getSystemMode()
  const headersList = await headers()

  // Detectar tenant por subdominio
  const tenantSlug = headersList.get('x-tenant-slug')
  let tenantBranding: TenantBranding | null = null

  if (tenantSlug) {
    const organization = await getOrganizationBySlug(tenantSlug)

    if (organization) {
      tenantBranding = {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logoUrl: organization.logoUrl,
        colors: organization.colors as TenantColors | null
      }
    }
  }

  return (
    <html id='__next' lang={locale} dir={direction} className={outfit.variable} suppressHydrationWarning>
      <body className={`${outfit.className} flex is-full min-bs-full flex-auto flex-col`}>
        <InitColorSchemeScript attribute='data' defaultMode={systemMode} />
        <Providers direction={direction} tenantBranding={tenantBranding} initialLocale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
