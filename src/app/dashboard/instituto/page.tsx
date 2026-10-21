import PermissionGuard from '@/hocs/PermissionGuard'
import InstitutoDashboard from '@/views/instituto/InstitutoDashboard'
import { getInstitutoDashboardStats } from '@/app/server/institutoActions'

export const metadata = {
  title: 'Instituto Life - Noah',
  description: 'Panel del Instituto Life'
}

async function PageContent() {
  const stats = await getInstitutoDashboardStats()

  return <InstitutoDashboard stats={stats} />
}

export default function InstitutoPage() {
  return (
    <PermissionGuard permission='instituto.ver'>
      <PageContent />
    </PermissionGuard>
  )
}
