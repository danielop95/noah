// Next Imports
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

// Type Imports
import type { ChildrenType } from '@core/types'

// Service Imports
import { getOrganizationBySlug } from '@/services/organizationService'
import { getMainDomainUrl } from '@/utils/domain'

const TenantLayout = async ({ children }: ChildrenType) => {
  const headersList = await headers()
  const tenantSlug = headersList.get('x-tenant-slug')

  // Construir URL del dominio principal para redirecciones
  const mainUrl = getMainDomainUrl()

  // Si no hay tenant (subdominio), redirigir a la landing publica del dominio principal
  if (!tenantSlug) {
    redirect(mainUrl)
  }

  // Verificar que el tenant existe
  const organization = await getOrganizationBySlug(tenantSlug)

  if (!organization) {
    // Tenant no existe - redirigir a la landing del dominio principal
    redirect(mainUrl)
  }

  // El branding del tenant ya se maneja en el root layout
  return <>{children}</>
}

export default TenantLayout
