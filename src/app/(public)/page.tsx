// Next Imports
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

// Component Imports
import NoahLanding from '@views/NoahLanding'

// Util Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Noah - Sistema de Gestion de Iglesias',
  description:
    'Noah es la plataforma lider para la gestion integral de iglesias modernas. Administra miembros, grupos, eventos y mas.'
}

const LandingPage = async () => {
  const headersList = await headers()
  const tenantSlug = headersList.get('x-tenant-slug')

  // Si hay tenant (subdominio), redirigir al dashboard
  if (tenantSlug) {
    redirect('/dashboard')
  }

  const mode = await getServerMode()

  return <NoahLanding mode={mode} />
}

export default LandingPage
