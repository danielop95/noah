// Next Imports
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

// MUI Imports
import Button from '@mui/material/Button'

// Auth Imports
import { authOptions } from '@/libs/auth'

// Type Imports
import type { ChildrenType } from '@core/types'

// Service Imports
import { getOrganizationBySlug, getOrganizationById } from '@/services/organizationService'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Layout Imports
import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'
import HorizontalLayout from '@layouts/HorizontalLayout'

// Component Imports
import Navigation from '@components/layout/vertical/Navigation'
import Header from '@components/layout/horizontal/Header'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'
import HorizontalFooter from '@components/layout/horizontal/Footer'
import ScrollToTop from '@core/components/scroll-to-top'
import AuthGuard from '@/hocs/AuthGuard'

// Util Imports
import { getDictionaryFromCookie, getLocaleFromCookie } from '@/utils/getDictionary'
import { getMode, getSystemMode } from '@core/utils/serverHelpers'

const DashboardLayout = async ({ children }: ChildrenType) => {
  // Obtener session y locale
  const session = await getServerSession(authOptions)
  const locale = await getLocaleFromCookie()
  const dictionary = await getDictionaryFromCookie()
  const mode = await getMode()
  const systemMode = await getSystemMode()
  const userRole = session?.user?.role || 'user'

  // Obtener tenant desde header
  const headersList = await headers()
  const tenantSlug = headersList.get('x-tenant-slug')
  const host = headersList.get('host') || ''

  if (tenantSlug) {
    // Verificar que el usuario pertenece a este tenant
    const organization = await getOrganizationBySlug(tenantSlug)

    if (organization && session?.user?.organizationId && session.user.organizationId !== organization.id) {
      // Usuario pertenece a OTRO tenant - redirigir a su subdominio correcto
      const userOrg = await getOrganizationById(session.user.organizationId)

      if (userOrg) {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
        const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || host.split('.').slice(-2).join('.')
        const redirectUrl = `${protocol}://${userOrg.slug}.${mainDomain}${themeConfig.homePageUrl}`

        redirect(redirectUrl)
      }
    }
  } else if (session?.user?.organizationId) {
    // No hay subdominio, pero el usuario tiene organizacion
    // Redirigir al subdominio correcto del usuario
    const organization = await getOrganizationById(session.user.organizationId)

    if (organization) {
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
      const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || host.split('.').slice(-2).join('.')
      const redirectUrl = `${protocol}://${organization.slug}.${mainDomain}${themeConfig.homePageUrl}`

      redirect(redirectUrl)
    }
  }

  return (
    <AuthGuard>
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
        <Button variant='contained' className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'>
          <i className='ri-arrow-up-line' />
        </Button>
      </ScrollToTop>
    </AuthGuard>
  )
}

export default DashboardLayout
