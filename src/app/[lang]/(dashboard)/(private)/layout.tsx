// Next Imports
import { headers } from 'next/headers'
import { getServerSession } from 'next-auth'

// MUI Imports
import Button from '@mui/material/Button'

// Auth Imports
import { authOptions } from '@/libs/auth'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Service Imports
import {
  getOrganizationBySlug,
  getOrganizationById,
  type TenantColors,
  type TenantBranding
} from '@/services/organizationService'

// Layout Imports
import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'
import HorizontalLayout from '@layouts/HorizontalLayout'

// Component Imports
import Providers from '@components/Providers'
import Navigation from '@components/layout/vertical/Navigation'
import Header from '@components/layout/horizontal/Header'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'
import HorizontalFooter from '@components/layout/horizontal/Footer'
// Customizer eliminado - los colores se controlan desde Configuración
import ScrollToTop from '@core/components/scroll-to-top'
import AuthGuard from '@/hocs/AuthGuard'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import { getMode, getSystemMode } from '@core/utils/serverHelpers'

const Layout = async (props: ChildrenType & { params: Promise<{ lang: string }> }) => {
  const params = await props.params

  const { children } = props

  // Type guard to ensure lang is a valid Locale
  const lang: Locale = i18n.locales.includes(params.lang as Locale) ? (params.lang as Locale) : i18n.defaultLocale

  // Vars
  const direction = i18n.langDirection[lang]
  const dictionary = await getDictionary(lang)
  const mode = await getMode()
  const systemMode = await getSystemMode()

  // Obtener sesión para verificar rol de usuario
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role || 'user'

  // Obtener branding del tenant desde el header inyectado por el middleware
  const headersList = await headers()
  const tenantSlug = headersList.get('x-tenant-slug')

  let tenantBranding: TenantBranding | null = null

  if (tenantSlug) {
    // Prioridad 1: Hay subdominio, usar ese tenant
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
  } else if (session?.user?.organizationId) {
    // Prioridad 2: No hay subdominio, pero el usuario tiene organización
    // Cargar branding de la organización del usuario
    const organization = await getOrganizationById(session.user.organizationId)

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
    <Providers direction={direction} tenantBranding={tenantBranding}>
      <AuthGuard locale={lang}>
        <LayoutWrapper
          systemMode={systemMode}
          verticalLayout={
            <VerticalLayout
              navigation={<Navigation dictionary={dictionary} mode={mode} userRole={userRole} />}
              navbar={<Navbar />}
              footer={<VerticalFooter />}
            >
              {children}
            </VerticalLayout>
          }
          horizontalLayout={
            <HorizontalLayout header={<Header dictionary={dictionary} userRole={userRole} />} footer={<HorizontalFooter />}>
              {children}
            </HorizontalLayout>
          }
        />
        <ScrollToTop className='mui-fixed'>
          <Button
            variant='contained'
            className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'
          >
            <i className='ri-arrow-up-line' />
          </Button>
        </ScrollToTop>
      </AuthGuard>
    </Providers>
  )
}

export default Layout
