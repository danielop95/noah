import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

import AuthRedirect from '@/components/AuthRedirect'
import NotAuthorized from '@/views/NotAuthorized'
import PendingReportsView from '@/views/reportes/PendingReportsView'

import { getDetailedUnreportedGroups, getActiveVacationPeriod, getGroupsForReporting } from '@/app/server/reportActions'
import { getUserOrganizationId } from '@/app/server/helpers'

import { getServerMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Reportes Pendientes - Noah',
  description: 'Detalle de grupos con reportes pendientes'
}

const PendientesPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session) {
    return <AuthRedirect />
  }

  const groups = await getGroupsForReporting()

  if ((session.user.roleHierarchy ?? 999) > 2 && groups.length === 0) {
    const mode = await getServerMode()

    return <NotAuthorized mode={mode} />
  }

  const organizationId = await getUserOrganizationId(session.user.id)

  const [detailedGroups, activeVacation] = await Promise.all([
    getDetailedUnreportedGroups(),
    organizationId ? getActiveVacationPeriod(organizationId) : null
  ])

  return (
    <PendingReportsView
      groups={detailedGroups}
      activeVacation={activeVacation}
      reportGroups={groups}
      isAdmin={(session.user.roleHierarchy ?? 999) <= 2}
    />
  )
}

export default PendientesPage
