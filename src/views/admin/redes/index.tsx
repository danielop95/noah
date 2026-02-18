'use client'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'

import NetworkListTable from './NetworkListTable'
import type { UserOption } from './UserMultiSelect'

type NetworkUser = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  image: string | null
  email: string | null
  networkRole: string | null
}

type NetworkRow = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: Date
  users: NetworkUser[]
  _count: { users: number }
}

type RedesViewProps = {
  networks: NetworkRow[]
  users: UserOption[]
}

const RedesView = ({ networks, users }: RedesViewProps) => {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <Typography variant='h4'>Redes</Typography>
        <Typography variant='body2' color='textSecondary'>
          Organiza a los miembros de tu iglesia segun sus intereses
        </Typography>
      </div>

      <Card>
        <NetworkListTable networks={networks} users={users} onRefresh={handleRefresh} />
      </Card>
    </div>
  )
}

export default RedesView
