import { notFound } from 'next/navigation'

import PermissionGuard from '@/hocs/PermissionGuard'
import AreaDetailView from '@/views/admin/areas/detail'
import { getAreaById, getAvailableUsersForArea } from '@/app/server/areasActions'

type Props = {
  params: Promise<{ id: string }>
}

const AreaDetailPage = async ({ params }: Props) => {
  const { id } = await params

  let area
  let availableUsers

  try {
    ;[area, availableUsers] = await Promise.all([getAreaById(id), getAvailableUsersForArea(id)])
  } catch {
    notFound()
  }

  return (
    <PermissionGuard permission='areas.ver'>
      <AreaDetailView area={area} availableUsers={availableUsers} />
    </PermissionGuard>
  )
}

export default AreaDetailPage
