// Next Auth
import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'
import PermissionGuard from '@/hocs/PermissionGuard'
import ConfiguracionView from '@/views/admin/Configuracion'
import VacationPeriodsCard from '@/views/admin/VacationPeriodsCard'

// Context
import { TenantProvider } from '@/contexts/TenantContext'

// Server Action Imports
import { getVacationPeriods } from '@/app/server/adminActions'
import { getSingleOrganization } from '@/utils/getOrganization'

export const metadata = {
  title: 'Configuración - Noah',
  description: 'Configuración de la organización y periodos de vacaciones'
}

const ConfiguracionPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return <AuthRedirect />
  }

  const [vacationPeriods, tenant] = await Promise.all([getVacationPeriods(), getSingleOrganization()])

  return (
    <PermissionGuard permission='configuracion.ver'>
      <TenantProvider tenant={tenant}>
        <ConfiguracionView>
          <VacationPeriodsCard initialPeriods={vacationPeriods} />
        </ConfiguracionView>
      </TenantProvider>
    </PermissionGuard>
  )
}

export default ConfiguracionPage
