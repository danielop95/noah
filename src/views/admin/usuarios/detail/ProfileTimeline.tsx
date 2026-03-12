'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import { styled } from '@mui/material/styles'
import MuiTimeline from '@mui/lab/Timeline'
import type { TimelineProps } from '@mui/lab/Timeline'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

const Timeline = styled(MuiTimeline)<TimelineProps>({
  '& .MuiTimelineItem-root': {
    '&:before': {
      display: 'none'
    }
  }
})

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

const ProfileTimeline = ({ reports }: Props) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatRelativeDate = (date: Date) => {
    const now = new Date()
    const d = new Date(date)
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hoy'
    if (diffDays === 1) return 'Ayer'
    if (diffDays < 7) return `Hace ${diffDays} dias`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`

    return formatDate(date)
  }

  const dotColors: Array<'primary' | 'success' | 'info' | 'warning' | 'error'> = [
    'primary', 'success', 'info', 'warning', 'error'
  ]

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader
          title='Actividad Reciente'
          avatar={<i className='ri-time-line text-textSecondary' />}
          titleTypographyProps={{ variant: 'h5' }}
        />
        <CardContent>
          <div className='flex flex-col items-center justify-center py-8'>
            <CustomAvatar skin='light' color='secondary' size={56} sx={{ mb: 2 }}>
              <i className='ri-file-list-3-line text-2xl' />
            </CustomAvatar>
            <Typography variant='body1' color='text.secondary'>
              Sin reportes recientes
            </Typography>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Actividad Reciente'
        subheader={`Ultimos ${reports.length} reportes de grupo`}
        avatar={<i className='ri-time-line text-textSecondary' />}
        titleTypographyProps={{ variant: 'h5' }}
      />
      <CardContent>
        <Timeline>
          {reports.map((report, index) => {
            const isLast = index === reports.length - 1
            const color = dotColors[index % dotColors.length]

            return (
              <TimelineItem key={report.id}>
                <TimelineSeparator>
                  <TimelineDot color={color} />
                  {!isLast && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <div className='flex items-center justify-between flex-wrap gap-x-4 pbe-1.5'>
                    <Typography className='font-medium' color='text.primary'>
                      Reunion - {report.group.name}
                    </Typography>
                    <Typography variant='caption' color='text.disabled'>
                      {formatRelativeDate(report.meetingDate)}
                    </Typography>
                  </div>
                  <Typography variant='body2' color='text.secondary' className='mbe-2'>
                    {formatDate(report.meetingDate)}
                  </Typography>
                  <div className='flex flex-wrap gap-2'>
                    <Chip
                      icon={<i className='ri-group-line' />}
                      label={`${report.totalAttendees} asistentes`}
                      size='small'
                      variant='tonal'
                      color='primary'
                    />
                    <Chip
                      icon={<i className='ri-star-line' />}
                      label={`${report.leadersCount} lideres`}
                      size='small'
                      variant='tonal'
                      color='warning'
                    />
                    <Chip
                      icon={<i className='ri-user-add-line' />}
                      label={`${report.visitorsCount} visitas`}
                      size='small'
                      variant='tonal'
                      color='success'
                    />
                    {report.reportOffering && report.offeringAmount != null && (
                      <Chip
                        icon={<i className='ri-money-dollar-circle-line' />}
                        label={new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0
                        }).format(Number(report.offeringAmount))}
                        size='small'
                        variant='tonal'
                        color='info'
                      />
                    )}
                  </div>
                </TimelineContent>
              </TimelineItem>
            )
          })}
        </Timeline>
      </CardContent>
    </Card>
  )
}

export default ProfileTimeline
