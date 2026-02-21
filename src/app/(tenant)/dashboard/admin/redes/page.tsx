// Component Imports
import AdminGuard from '@/hocs/AdminGuard'
import RedesView from '@/views/admin/redes'

// Server Action Imports
import { getAllNetworks, getOrganizationUsers } from '@/app/server/networkActions'

export const metadata = {
  title: 'Redes - Noah',
  description: 'Gestiona las redes de tu iglesia'
}

const RedesPage = async () => {
  const [networks, users] = await Promise.all([getAllNetworks(), getOrganizationUsers()])

  return (
    <AdminGuard>
      <RedesView networks={networks} users={users} />
    </AdminGuard>
  )
}

export default RedesPage
