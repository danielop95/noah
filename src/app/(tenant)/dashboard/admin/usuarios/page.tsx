// Component Imports
import AdminGuard from '@/hocs/AdminGuard'
import UserList from '@/views/apps/user/list'

// Server Action Imports
import { getAllUsers } from '@/app/server/adminActions'

const UsersPage = async () => {
  const users = await getAllUsers()

  return (
    <AdminGuard>
      <UserList users={users} />
    </AdminGuard>
  )
}

export default UsersPage
