// Next Imports
import type { Metadata } from 'next'
import { headers } from 'next/headers'

// Component Imports
import Login from '@views/Login'
import BlankLayout from '@layouts/BlankLayout'

// HOC Imports
import GuestOnlyRoute from '@/hocs/GuestOnlyRoute'

// Util Imports
import { getServerMode, getSystemMode } from '@core/utils/serverHelpers'
import { getOrganizationBySlug } from '@/services/organizationService'

export const metadata: Metadata = {
  title: 'Iniciar Sesion',
  description: 'Inicia sesion en tu cuenta'
}

const TenantLoginPage = async () => {
  const mode = await getServerMode()
  const systemMode = await getSystemMode()
  const headersList = await headers()
  const tenantSlug = headersList.get('x-tenant-slug')

  // Obtener datos del tenant para branding
  let tenantBranding = null

  if (tenantSlug) {
    const org = await getOrganizationBySlug(tenantSlug)

    if (org) {
      const colors = org.colors as { primary?: string; secondary?: string } | null

      tenantBranding = {
        name: org.name,
        logoUrl: org.logoUrl,
        primaryColor: colors?.primary || '#0466C8'
      }
    }
  }

  return (
    <GuestOnlyRoute>
      <BlankLayout systemMode={systemMode}>
        <Login mode={mode} tenant={tenantBranding} />
      </BlankLayout>
    </GuestOnlyRoute>
  )
}

export default TenantLoginPage
