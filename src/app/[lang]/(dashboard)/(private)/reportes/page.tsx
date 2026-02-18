// Type Imports
import type { Locale } from '@configs/i18n'
import { i18n } from '@configs/i18n'

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
  description: 'Reportes de reuniones y estadísticas de grupos'
}

const ReportesPage = async (props: { params: Promise<{ lang: string }> }) => {
  const params = await props.params
  const lang: Locale = i18n.locales.includes(params.lang as Locale) ? (params.lang as Locale) : i18n.defaultLocale

  // Check authentication
  const session = await getServerSession(authOptions)

  if (!session) {
    return <AuthRedirect lang={lang} />
  }

  // Get groups user can report for
  const groups = await getGroupsForReporting()

  // If user is not admin and doesn't lead any groups, show unauthorized
  if (session.user.role !== 'admin' && groups.length === 0) {
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
      isAdmin={session.user.role === 'admin'}
      currentUserId={session.user.id}
    />
  )
}

export default ReportesPage
