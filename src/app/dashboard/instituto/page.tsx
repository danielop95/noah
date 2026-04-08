import PermissionGuard from '@/hocs/PermissionGuard'
import InstitutoDashboard from '@/views/instituto/InstitutoDashboard'
import { getInstitutoDashboardStats } from '@/app/server/institutoActions'

export const metadata = {
  title: 'Instituto Life - Noah',
  description: 'Panel del Instituto Life'
}

const InstitutoPage = async () => {
  const stats = await getInstitutoDashboardStats()

  return (
    <PermissionGuard permission='instituto.ver'>
      <InstitutoDashboard stats={stats} />
    </PermissionGuard>
  )
}

export default InstitutoPage
