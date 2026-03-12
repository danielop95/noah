// Component Imports
import PermissionGuard from '@/hocs/PermissionGuard'
import GroupDetailView from '@/views/admin/grupos/detail'

// Server Action Imports
import { getGroupFullDetails } from '@/app/server/groupActions'

export const metadata = {
  title: 'Detalle de Grupo - Noah',
  description: 'Información completa del grupo'
}

type Props = {
  params: Promise<{ id: string }>
}

const GroupDetailPage = async ({ params }: Props) => {
  const { id } = await params

  const group = await getGroupFullDetails(id)

  if (!group) {
    return (
      <div className='flex justify-center items-center min-bs-[400px]'>
        <p>Grupo no encontrado</p>
      </div>
    )
  }

  return (
    <PermissionGuard permission='grupos.ver'>
      <GroupDetailView group={group} />
    </PermissionGuard>
  )
}

export default GroupDetailPage
