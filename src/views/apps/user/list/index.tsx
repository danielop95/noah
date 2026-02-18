'use client'

// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'

// Component Imports
import UserListTable from './UserListTable'

type UserListUser = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  city: string | null
  isActive: boolean
  createdAt: Date
  networkId: string | null
  networkRole: string | null
  network: { id: string; name: string } | null
  groupLeaderships: Array<{ group: { id: string; name: string } }>
}

const UserList = ({ users }: { users: UserListUser[] }) => {
  return (
    <div className='flex flex-col gap-6'>
      <Typography variant='h4'>Usuarios</Typography>
      <Card>
        <UserListTable users={users} />
      </Card>
    </div>
  )
}

export default UserList
