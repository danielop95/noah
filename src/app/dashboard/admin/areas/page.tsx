import PermissionGuard from '@/hocs/PermissionGuard'
import AreasView from '@/views/admin/areas'
import { getAllAreas } from '@/app/server/areasActions'

export const metadata = {
  title: 'Áreas - Noah',
  description: 'Gestiona las áreas y ministerios de tu iglesia'
}

const AreasPage = async () => {
  const areas = await getAllAreas()

  return (
    <PermissionGuard permission='areas.ver'>
      <AreasView areas={areas} />
    </PermissionGuard>
  )
}

export default AreasPage
