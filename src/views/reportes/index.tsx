'use client'

import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

import ReportListTable from './ReportListTable'
import type { ReportWithDetails, GroupOptionForReports, UnreportedGroup, VacationPeriodInfo } from '@/app/server/reportActions'

type ReportesViewProps = {
  reports: ReportWithDetails[]
  groups: GroupOptionForReports[]
  networks: { id: string; name: string }[]
  isAdmin: boolean
  currentUserId: string
  unreportedGroups: UnreportedGroup[]
  activeVacation: VacationPeriodInfo
}

const formatDateShort = (date: Date) => {
  return new Date(date).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })
}

const ReportesView = ({
  reports,
  groups,
  networks,
  isAdmin,
  currentUserId,
  unreportedGroups,
  activeVacation
}: ReportesViewProps) => {
  const router = useRouter()

  const handleRefresh = () => {
    router.refresh()
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Alerta de vacaciones activas */}
      {activeVacation && (
        <Alert severity='info' icon={<i className='solar-calendar-mark-linear' />}>
          Periodo de vacaciones activo{activeVacation.name ? `: ${activeVacation.name}` : ''} (
          {formatDateShort(activeVacation.startDate)} — {formatDateShort(activeVacation.endDate)}). No se requieren
          reportes durante este periodo.
        </Alert>
      )}

      {/* Alerta de reportes pendientes */}
      {!activeVacation && unreportedGroups.length > 0 && (
        <Alert severity='warning' icon={<i className='solar-danger-triangle-linear' />}>
          {isAdmin ? (
            <>
              <strong>{unreportedGroups.length} grupo{unreportedGroups.length > 1 ? 's' : ''}</strong> no ha
              {unreportedGroups.length > 1 ? 'n' : ''} reportado esta semana:{' '}
              {unreportedGroups.map(g => g.name).join(', ')}
            </>
          ) : (
            <>
              No has reportado la reunión de esta semana para{' '}
              <strong>{unreportedGroups.map(g => `${g.name} (esperado: ${formatDateShort(g.expectedDate)})`).join(', ')}</strong>
            </>
          )}
          <Button
            size='small'
            color='warning'
            href='/dashboard/reportes/pendientes'
            sx={{ ml: 1, textTransform: 'none' }}
          >
            Ver detalle →
          </Button>
        </Alert>
      )}

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
