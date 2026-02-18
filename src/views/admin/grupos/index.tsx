'use client'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'

import GroupListTable from './GroupListTable'
import type { GroupWithDetails, NetworkOption } from '@/app/server/groupActions'

type GruposViewProps = {
  groups: GroupWithDetails[]
  networks: NetworkOption[]
}

const GruposView = ({ groups, networks }: GruposViewProps) => {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <Typography variant='h4'>Grupos</Typography>
        <Typography variant='body2' color='textSecondary'>
          Espacios de reunion para miembros e invitados
        </Typography>
      </div>

      <Card>
        <GroupListTable groups={groups} networks={networks} onRefresh={handleRefresh} />
      </Card>
    </div>
  )
}

export default GruposView
