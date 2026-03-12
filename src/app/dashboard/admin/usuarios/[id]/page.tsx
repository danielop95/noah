// Component Imports
import PermissionGuard from '@/hocs/PermissionGuard'
import UserDetailView from '@/views/admin/usuarios/detail'

// Server Action Imports
import { getUserFullDetails } from '@/app/server/actions'

export const metadata = {
  title: 'Detalle de Usuario - Noah',
  description: 'Informacion completa del usuario'
}

type Props = {
  params: Promise<{ id: string }>
}

const UserViewPage = async ({ params }: Props) => {
  const { id } = await params

  const user = await getUserFullDetails(id)

  if (!user) {
    return (
      <div className='flex justify-center items-center min-bs-[400px]'>
        <p>Usuario no encontrado</p>
      </div>
    )
  }

  return (
    <PermissionGuard permission='usuarios.ver'>
      <UserDetailView user={user} />
    </PermissionGuard>
  )
}

export default UserViewPage
