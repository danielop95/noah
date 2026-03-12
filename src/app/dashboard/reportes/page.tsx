// Next Auth
import { getServerSession } from 'next-auth'

import { authOptions } from '@/libs/auth'

// Component Imports
import AuthRedirect from '@/components/AuthRedirect'
import NotAuthorized from '@/views/NotAuthorized'
import ReportesView from '@/views/reportes'

// Server Action Imports
import { getAllReports, getGroupsForReporting, getNetworksForReportFilters } from '@/app/server/reportActions'

// Utils
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata = {
  title: 'Reportes de Grupos - Noah',
  description: 'Reportes de reuniones y estadisticas de grupos'
}

const ReportesPage = async () => {
  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return <AuthRedirect />
  }

  // Get groups user can report for
  const groups = await getGroupsForReporting()

  // If user is not admin and doesn't lead any groups, show unauthorized
  if ((session.user.roleHierarchy ?? 999) > 2 && groups.length === 0) {
    const mode = await getServerMode()

    return <NotAuthorized mode={mode} />
  }

  // Fetch data
  const [reports, networks] = await Promise.all([getAllReports(), getNetworksForReportFilters()])

  return (
    <ReportesView
      reports={reports}
      groups={groups}
      networks={networks}
      isAdmin={(session.user.roleHierarchy ?? 999) <= 2}
      currentUserId={session.user.id}
    />
  )
}

export default ReportesPage
