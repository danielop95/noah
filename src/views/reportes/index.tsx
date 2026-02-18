'use client'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'

import ReportListTable from './ReportListTable'
import type { ReportWithDetails, GroupOptionForReports } from '@/app/server/reportActions'

type ReportesViewProps = {
  reports: ReportWithDetails[]
  groups: GroupOptionForReports[]
  networks: { id: string; name: string }[]
  isAdmin: boolean
  currentUserId: string
}

const ReportesView = ({ reports, groups, networks, isAdmin, currentUserId }: ReportesViewProps) => {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <Typography variant='h4'>Reportes de Grupos</Typography>
        <Typography variant='body2' color='textSecondary'>
          {isAdmin
            ? 'Seguimiento de reuniones y ofrendas de todos los grupos'
            : 'Reporta las reuniones de tus grupos'}
        </Typography>
      </div>

      <Card>
        <ReportListTable
          initialReports={reports}
          groups={groups}
          networks={networks}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onRefresh={handleRefresh}
        />
      </Card>
    </div>
  )
}

export default ReportesView
