// Component Imports
import AdminGuard from '@/hocs/AdminGuard'
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
    <AdminGuard>
      <GroupDetailView group={group} />
    </AdminGuard>
  )
}

export default GroupDetailPage
