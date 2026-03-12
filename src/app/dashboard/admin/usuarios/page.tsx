// Component Imports
import PermissionGuard from '@/hocs/PermissionGuard'
import UserList from '@/views/apps/user/list'

// Server Action Imports
import { getAllUsers } from '@/app/server/adminActions'

const UsersPage = async () => {
  const users = await getAllUsers()

  return (
    <PermissionGuard permission='usuarios.ver'>
      <UserList users={users} />
    </PermissionGuard>
  )
}

export default UsersPage
