// Next Imports
import type { Metadata } from 'next'

// Component Imports
import AdminGuard from '@/hocs/AdminGuard'
import ConfiguracionView from '@/views/admin/Configuracion'

export const metadata: Metadata = {
  title: 'Configuracion - Noah',
  description: 'Configura tu iglesia en Noah'
}

const ConfiguracionPage = async () => {
  return (
    <AdminGuard>
      <ConfiguracionView />
    </AdminGuard>
  )
}

export default ConfiguracionPage
