// Next Imports
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

// Component Imports
import NoahLanding from '@views/NoahLanding'

// Util Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Noah - Sistema de Gestión de Iglesias',
  description: 'Sistema de gestión para iglesias'
}

type Props = {
  params: Promise<{ lang: string }>
}

const LandingPage = async ({ params }: Props) => {
  const headersList = await headers()
  const tenantSlug = headersList.get('x-tenant-slug')
  const { lang } = await params

  // Si hay tenant, redirigir al login normal del tenant
  if (tenantSlug) {
    redirect(`/${lang}/login`)
  }

  const mode = await getServerMode()

  return <NoahLanding mode={mode} />
}

export default LandingPage
