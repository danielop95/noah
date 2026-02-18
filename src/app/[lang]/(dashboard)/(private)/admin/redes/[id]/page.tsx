// Type Imports
import type { Locale } from '@configs/i18n'

// Config Imports
import { i18n } from '@configs/i18n'

// Component Imports
import AdminGuard from '@/hocs/AdminGuard'
import NetworkDetailView from '@/views/admin/redes/detail'

// Server Action Imports
import { getNetworkFullDetails } from '@/app/server/actions'

export const metadata = {
  title: 'Detalle de Red - Noah',
  description: 'Información completa de la red'
}

const NetworkDetailPage = async (props: { params: Promise<{ lang: string; id: string }> }) => {
  const params = await props.params
  const lang: Locale = i18n.locales.includes(params.lang as Locale) ? (params.lang as Locale) : i18n.defaultLocale

  const network = await getNetworkFullDetails(params.id)

  if (!network) {
    return (
      <div className='flex justify-center items-center min-bs-[400px]'>
        <p>Red no encontrada</p>
      </div>
    )
  }

  return (
    <AdminGuard locale={lang}>
      <NetworkDetailView network={network} />
    </AdminGuard>
  )
}

export default NetworkDetailPage
