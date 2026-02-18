// Next Imports
import type { Metadata } from 'next'
import { headers } from 'next/headers'

// Component Imports
import Login from '@views/Login'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

// Service Imports
import { getOrganizationBySlug } from '@/services/organizationService'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account'
}

const LoginPage = async () => {
  const mode = await getServerMode()
  const headersList = await headers()
  const tenantSlug = headersList.get('x-tenant-slug')

  // Obtener datos del tenant si existe
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

  return <Login mode={mode} tenant={tenantBranding} />
}

export default LoginPage
