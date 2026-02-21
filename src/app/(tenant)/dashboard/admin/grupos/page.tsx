// Component Imports
import AdminGuard from '@/hocs/AdminGuard'
import GruposView from '@/views/admin/grupos'

// Server Action Imports
import { getAllGroups, getNetworksForGroups } from '@/app/server/groupActions'

export const metadata = {
  title: 'Grupos - Noah',
  description: 'Gestiona los grupos de tu iglesia'
}

const GruposPage = async () => {
  const [groups, networks] = await Promise.all([getAllGroups(), getNetworksForGroups()])

  return (
    <AdminGuard>
      <GruposView groups={groups} networks={networks} />
    </AdminGuard>
  )
}

export default GruposPage
