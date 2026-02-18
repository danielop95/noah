'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'

type GroupReport = {
  id: string
  meetingDate: Date
  totalAttendees: number
  leadersCount: number
  visitorsCount: number
  reportOffering: boolean
  offeringAmount: unknown
  group: { id: string; name: string }
}

type Props = {
  reports: GroupReport[]
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const formatCurrency = (amount: unknown) => {
  const num = Number(amount) || 0

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(num)
}

const UserRecentReports = ({ reports }: Props) => {
  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader title='Reportes Recientes' />
        <CardContent>
          <Box className='flex flex-col items-center justify-center py-8'>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'action.hover', mb: 2 }}>
              <i className='ri-file-list-3-line text-3xl text-textSecondary' />
            </Avatar>
            <Typography color='text.secondary'>
              Este usuario no ha creado reportes
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Reportes Recientes'
        subheader={`Últimos ${reports.length} reportes`}
      />
      <CardContent className='flex flex-col gap-4'>
        {reports.map(report => (
          <Box
            key={report.id}
            className='flex items-center gap-4 p-3 rounded-lg'
            sx={{ bgcolor: 'action.hover' }}
          >
            <Avatar variant='rounded' sx={{ bgcolor: 'primary.main' }}>
              <i className='ri-calendar-line' />
            </Avatar>
            <Box className='flex-1'>
              <div className='flex items-center gap-2 flex-wrap'>
                <Typography variant='subtitle2' className='font-medium'>
                  {report.group.name}
                </Typography>
                <Chip
                  label={formatDate(report.meetingDate)}
                  size='small'
                  variant='outlined'
                />
              </div>
              <div className='flex items-center gap-3 mbs-1'>
                <Typography variant='caption' color='text.secondary'>
                  <i className='ri-group-line mie-1' />
                  {report.totalAttendees} asistentes
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  <i className='ri-user-star-line mie-1' />
                  {report.leadersCount} líderes
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  <i className='ri-user-add-line mie-1' />
                  {report.visitorsCount} visitas
                </Typography>
              </div>
            </Box>
            {report.reportOffering && (
              <Chip
                label={formatCurrency(report.offeringAmount)}
                size='small'
                color='success'
                variant='tonal'
              />
            )}
          </Box>
        ))}
      </CardContent>
    </Card>
  )
}

export default UserRecentReports
