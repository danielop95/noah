'use client'

import { useEffect, useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import Skeleton from '@mui/material/Skeleton'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import MuiTimeline from '@mui/lab/Timeline'
import type { TimelineProps } from '@mui/lab/Timeline'

// Custom Components
import CustomAvatar from '@core/components/mui/Avatar'

// Server Actions
import { getDashboardStats, type DashboardStats } from '@/app/server/dashboardActions'

// Styled Timeline
const Timeline = styled(MuiTimeline)<TimelineProps>({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  }
})

// Días en español
const DAYS_LABELS: Record<string, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
}

// Tarjeta de bienvenida con ilustración
const WelcomeCard = ({ userName, stats }: { userName: string; stats: DashboardStats }) => (
  <Card className='relative overflow-visible'>
    <CardContent className='!pbe-0'>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 7 }}>
          <Typography variant='h4' className='mbe-2'>
            Bienvenido, <span className='font-bold'>{userName}</span>! 🙏
          </Typography>
          <Typography className='mbe-4' color='text.secondary'>
            Tu comunidad está creciendo. Este mes tienes {stats.newUsersThisMonth} nuevos miembros.
          </Typography>
          <Box className='flex flex-wrap gap-4 mbe-4'>
            <Box className='flex items-center gap-2'>
              <CustomAvatar skin='light' color='primary' size={40}>
                <i className='solar-users-group-rounded-linear text-xl' />
              </CustomAvatar>
              <Box>
                <Typography variant='h5' fontWeight={600}>
                  {stats.totalUsers}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Miembros
                </Typography>
              </Box>
            </Box>
            <Box className='flex items-center gap-2'>
              <CustomAvatar skin='light' color='info' size={40}>
                <i className='solar-share-circle-linear text-xl' />
              </CustomAvatar>
              <Box>
                <Typography variant='h5' fontWeight={600}>
                  {stats.totalNetworks}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Redes
                </Typography>
              </Box>
            </Box>
            <Box className='flex items-center gap-2'>
              <CustomAvatar skin='light' color='success' size={40}>
                <i className='solar-widget-2-linear text-xl' />
              </CustomAvatar>
              <Box>
                <Typography variant='h5' fontWeight={600}>
                  {stats.totalGroups}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Grupos
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 5 }} className='flex justify-center sm:absolute sm:inline-end-6 sm:bottom-0'>
          <img
            alt='Bienvenido'
            src='/images/illustrations/characters-with-objects/3.png'
            className='bs-auto max-is-full max-bs-[180px]'
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)

// Tarjeta de estadística con icono
const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  trendValue
}: {
  title: string
  value: number | string
  subtitle?: string
  icon: string
  color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'
  trend?: 'up' | 'down'
  trendValue?: string
}) => (
  <Card className='h-full'>
    <CardContent>
      <Box className='flex justify-between items-start mbe-4'>
        <CustomAvatar skin='light' color={color} size={44}>
          <i className={`${icon} text-[22px]`} />
        </CustomAvatar>
        {trend && trendValue && (
          <Chip
            size='small'
            variant='tonal'
            color={trend === 'up' ? 'success' : 'error'}
            label={
              <Box className='flex items-center gap-1'>
                <i className={`solar-arrow-${trend}-linear text-sm`} />
                {trendValue}
              </Box>
            }
          />
        )}
      </Box>
      <Typography variant='h4' fontWeight={600}>
        {value}
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant='caption' color='text.disabled'>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
)

// Tarjeta de progreso
const ProgressStatCard = ({
  title,
  value,
  total,
  color,
  icon
}: {
  title: string
  value: number
  total: number
  color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'
  icon: string
}) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <Card className='h-full'>
      <CardContent>
        <Box className='flex justify-between items-start mbe-4'>
          <CustomAvatar skin='light' color={color} size={44}>
            <i className={`${icon} text-[22px]`} />
          </CustomAvatar>
          <Typography variant='h6' color={`${color}.main`} fontWeight={600}>
            {percentage}%
          </Typography>
        </Box>
        <Typography variant='h4' fontWeight={600}>
          {value}
          <Typography component='span' variant='body2' color='text.secondary'>
            {' '}
            / {total}
          </Typography>
        </Typography>
        <Typography variant='body2' color='text.secondary' className='mbe-2'>
          {title}
        </Typography>
        <LinearProgress
          variant='determinate'
          value={percentage}
          color={color}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </CardContent>
    </Card>
  )
}

// Tarjeta de próximas reuniones
const UpcomingMeetingsCard = ({ groups }: { groups: DashboardStats['upcomingGroups'] }) => (
  <Card className='h-full'>
    <CardHeader
      title='Próximas Reuniones'
      titleTypographyProps={{ variant: 'h6' }}
      subheader='Grupos con reunión programada'
    />
    <CardContent className='flex flex-col gap-4'>
      {groups.length === 0 ? (
        <Box className='text-center py-6'>
          <CustomAvatar skin='light' color='secondary' size={56} sx={{ mx: 'auto', mb: 2 }}>
            <i className='solar-calendar-linear text-[28px]' />
          </CustomAvatar>
          <Typography variant='body2' color='text.secondary'>
            No hay reuniones programadas
          </Typography>
        </Box>
      ) : (
        groups.map(group => (
          <Box key={group.id} className='flex items-center gap-3'>
            <Avatar
              src={group.imageUrl || undefined}
              sx={{ width: 42, height: 42, bgcolor: 'primary.main' }}
              variant='rounded'
            >
              <i className='solar-widget-2-linear' />
            </Avatar>
            <Box className='flex-1 min-w-0'>
              <Typography variant='body2' fontWeight={500} noWrap>
                {group.name}
              </Typography>
              <Box className='flex items-center gap-1'>
                <i className='solar-clock-circle-linear text-sm text-textSecondary' />
                <Typography variant='caption' color='text.secondary'>
                  {DAYS_LABELS[group.meetingDay || ''] || group.meetingDay} {group.meetingTime || ''}
                </Typography>
              </Box>
            </Box>
            <Chip
              size='small'
              variant='tonal'
              color={group.modality === 'virtual' ? 'info' : 'success'}
              icon={<i className={group.modality === 'virtual' ? 'solar-video-frame-linear' : 'solar-map-point-linear'} />}
              label={group.modality === 'virtual' ? 'Virtual' : 'Presencial'}
            />
          </Box>
        ))
      )}
    </CardContent>
  </Card>
)

// Categorías de eventos con colores e iconos
const EVENT_CATEGORIES: Record<string, { color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'; icon: string; label: string }> = {
  culto: { color: 'primary', icon: 'solar-buildings-linear', label: 'Culto' },
  evento: { color: 'info', icon: 'solar-calendar-linear', label: 'Evento' },
  reunion: { color: 'warning', icon: 'solar-widget-2-linear', label: 'Reunion' },
  actividad: { color: 'success', icon: 'solar-running-2-linear', label: 'Actividad' },
  capacitacion: { color: 'secondary', icon: 'solar-book-linear', label: 'Capacitacion' }
}

// Tarjeta de próximos eventos del calendario
const UpcomingEventsCard = ({ events }: { events: DashboardStats['upcomingEvents'] }) => {
  const formatEventDate = (date: Date, allDay: boolean) => {
    const d = new Date(date)
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }

    if (!allDay) {
      options.hour = '2-digit'
      options.minute = '2-digit'
    }

    return d.toLocaleDateString('es-ES', options)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    const d = new Date(date)

    return d.toDateString() === today.toDateString()
  }

  const isTomorrow = (date: Date) => {
    const tomorrow = new Date()

    tomorrow.setDate(tomorrow.getDate() + 1)
    const d = new Date(date)

    return d.toDateString() === tomorrow.toDateString()
  }

  return (
    <Card className='h-full'>
      <CardHeader
        title='Proximos Eventos'
        titleTypographyProps={{ variant: 'h6' }}
        subheader='Del calendario'
        action={
          <IconButton href='/dashboard/calendario' component='a' size='small'>
            <i className='solar-arrow-right-linear' />
          </IconButton>
        }
      />
      <CardContent className='flex flex-col gap-4'>
        {events.length === 0 ? (
          <Box className='text-center py-6'>
            <CustomAvatar skin='light' color='secondary' size={56} sx={{ mx: 'auto', mb: 2 }}>
              <i className='solar-calendar-linear text-[28px]' />
            </CustomAvatar>
            <Typography variant='body2' color='text.secondary'>
              No hay eventos programados
            </Typography>
          </Box>
        ) : (
          events.map(event => {
            const category = EVENT_CATEGORIES[event.category] || EVENT_CATEGORIES.evento
            const eventDate = new Date(event.startDate)

            return (
              <Box key={event.id} className='flex items-start gap-3'>
                <CustomAvatar skin='light' color={category.color} size={42} variant='rounded'>
                  <i className={`${category.icon} text-xl`} />
                </CustomAvatar>
                <Box className='flex-1 min-w-0'>
                  <Box className='flex items-center gap-2 mbe-1'>
                    <Typography variant='body2' fontWeight={500} noWrap className='flex-1'>
                      {event.title}
                    </Typography>
                    {isToday(eventDate) && (
                      <Chip size='small' label='Hoy' color='error' variant='tonal' sx={{ height: 20 }} />
                    )}
                    {isTomorrow(eventDate) && (
                      <Chip size='small' label='Manana' color='warning' variant='tonal' sx={{ height: 20 }} />
                    )}
                  </Box>
                  <Box className='flex items-center gap-1'>
                    <i className='solar-clock-circle-linear text-sm text-textSecondary' />
                    <Typography variant='caption' color='text.secondary'>
                      {formatEventDate(eventDate, event.allDay)}
                    </Typography>
                  </Box>
                  {event.location && (
                    <Box className='flex items-center gap-1'>
                      <i className='solar-map-point-linear text-sm text-textSecondary' />
                      <Typography variant='caption' color='text.secondary' noWrap>
                        {event.location}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

// Top Redes con Timeline
const TopNetworksCard = ({ networks }: { networks: DashboardStats['topNetworks'] }) => {
  const colors: Array<'primary' | 'success' | 'info' | 'warning' | 'secondary'> = [
    'primary',
    'success',
    'info',
    'warning',
    'secondary'
  ]

  return (
    <Card className='h-full'>
      <CardHeader title='Redes Principales' titleTypographyProps={{ variant: 'h6' }} subheader='Por cantidad de miembros' />
      <CardContent>
        {networks.length === 0 ? (
          <Box className='text-center py-6'>
            <CustomAvatar skin='light' color='secondary' size={56} sx={{ mx: 'auto', mb: 2 }}>
              <i className='solar-share-circle-linear text-[28px]' />
            </CustomAvatar>
            <Typography variant='body2' color='text.secondary'>
              No hay redes registradas
            </Typography>
          </Box>
        ) : (
          <Timeline>
            {networks.map((network, index) => {
              const totalMembers = network.leaderCount + network.memberCount

              return (
                <TimelineItem key={network.id}>
                  <TimelineSeparator>
                    <TimelineDot color={colors[index % colors.length]} />
                    {index < networks.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Box className='flex items-center justify-between gap-2 mbe-1'>
                      <Box className='flex items-center gap-2'>
                        <Avatar
                          src={network.imageUrl || undefined}
                          sx={{ width: 32, height: 32, bgcolor: `${colors[index % colors.length]}.main` }}
                        >
                          {network.name.charAt(0)}
                        </Avatar>
                        <Typography variant='body2' fontWeight={500}>
                          {network.name}
                        </Typography>
                      </Box>
                      <Typography variant='body2' fontWeight={600} color='primary.main'>
                        {totalMembers}
                      </Typography>
                    </Box>
                    <Box className='flex gap-2 mbs-1'>
                      <Chip
                        size='small'
                        label={`${network.leaderCount} líderes`}
                        color='warning'
                        variant='outlined'
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                      <Chip
                        size='small'
                        label={`${network.memberCount} miembros`}
                        color='primary'
                        variant='outlined'
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              )
            })}
          </Timeline>
        )}
      </CardContent>
    </Card>
  )
}

// Miembros recientes
const RecentMembersCard = ({ users }: { users: DashboardStats['recentUsers'] }) => (
  <Card className='h-full'>
    <CardHeader title='Miembros Recientes' titleTypographyProps={{ variant: 'h6' }} subheader='Últimos registros' />
    <CardContent className='flex flex-col gap-4'>
      {users.length === 0 ? (
        <Box className='text-center py-6'>
          <CustomAvatar skin='light' color='secondary' size={56} sx={{ mx: 'auto', mb: 2 }}>
            <i className='solar-user-linear text-[28px]' />
          </CustomAvatar>
          <Typography variant='body2' color='text.secondary'>
            No hay miembros registrados
          </Typography>
        </Box>
      ) : (
        users.map(user => {
          const displayName =
            user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.name || 'Sin nombre'

          const initials = displayName
            .split(' ')
            .map(n => n.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase()

          return (
            <Box key={user.id} className='flex items-center gap-3'>
              <Avatar src={user.image || undefined} sx={{ width: 38, height: 38, bgcolor: 'secondary.main' }}>
                {initials}
              </Avatar>
              <Box className='flex-1 min-w-0'>
                <Typography variant='body2' fontWeight={500} noWrap>
                  {displayName}
                </Typography>
                <Typography variant='caption' color='text.disabled'>
                  {new Date(user.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </Typography>
              </Box>
              <Chip size='small' label='Nuevo' color='success' variant='tonal' />
            </Box>
          )
        })
      )}
    </CardContent>
  </Card>
)

// Resumen de distribución
const DistributionCard = ({ stats }: { stats: DashboardStats }) => {
  const items = [
    { label: 'En Redes', value: stats.usersWithNetwork, total: stats.totalUsers, color: 'success' as const, icon: 'solar-check-circle-linear' },
    { label: 'Sin Red', value: stats.usersWithoutNetwork, total: stats.totalUsers, color: 'warning' as const, icon: 'solar-user-block-linear' },
    { label: 'Inactivos', value: stats.inactiveUsers, total: stats.totalUsers, color: 'error' as const, icon: 'solar-user-block-linear' }
  ]

  return (
    <Card className='h-full'>
      <CardHeader title='Distribución de Miembros' titleTypographyProps={{ variant: 'h6' }} />
      <CardContent className='flex flex-col gap-4'>
        {items.map(item => {
          const percentage = stats.totalUsers > 0 ? Math.round((item.value / item.total) * 100) : 0

          return (
            <Box key={item.label}>
              <Box className='flex justify-between items-center mbe-2'>
                <Box className='flex items-center gap-2'>
                  <CustomAvatar skin='light' color={item.color} size={28}>
                    <i className={`${item.icon} text-sm`} />
                  </CustomAvatar>
                  <Typography variant='body2'>{item.label}</Typography>
                </Box>
                <Typography variant='body2' fontWeight={600}>
                  {item.value} ({percentage}%)
                </Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={percentage}
                color={item.color}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )
        })}
        <Divider sx={{ my: 1 }} />
        <Box className='flex justify-between items-center'>
          <Typography variant='body2' fontWeight={500}>
            Total de miembros
          </Typography>
          <Typography variant='h5' fontWeight={600} color='primary.main'>
            {stats.totalUsers}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

// Tarjeta de estado de reportes semanales
const WeeklyReportingCard = ({ stats }: { stats: DashboardStats }) => {
  const { reportingProgress, isVacationPeriod, vacationPeriodName } = stats
  const { expected, reported, unreportedGroups } = reportingProgress
  const allReported = expected > 0 && reported === expected

  if (isVacationPeriod) {
    return (
      <Card className='h-full'>
        <CardHeader
          title='Reportes Semanales'
          titleTypographyProps={{ variant: 'h6' }}
          subheader='Estado de reportes de grupos'
        />
        <CardContent>
          <Box className='flex flex-col items-center gap-3 py-4'>
            <CustomAvatar skin='light' color='info' size={56}>
              <i className='solar-calendar-mark-linear text-[28px]' />
            </CustomAvatar>
            <Typography variant='body2' color='text.secondary' textAlign='center'>
              Periodo de vacaciones{vacationPeriodName ? `: ${vacationPeriodName}` : ''}
            </Typography>
            <Typography variant='caption' color='text.disabled' textAlign='center'>
              No se requieren reportes durante este periodo
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (expected === 0) {
    return (
      <Card className='h-full'>
        <CardHeader
          title='Reportes Semanales'
          titleTypographyProps={{ variant: 'h6' }}
          subheader='Estado de reportes de grupos'
        />
        <CardContent>
          <Box className='flex flex-col items-center gap-3 py-4'>
            <CustomAvatar skin='light' color='secondary' size={56}>
              <i className='solar-chart-square-linear text-[28px]' />
            </CustomAvatar>
            <Typography variant='body2' color='text.secondary' textAlign='center'>
              No hay reportes esperados esta semana
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  const percentage = Math.round((reported / expected) * 100)

  return (
    <Card className='h-full'>
      <CardHeader
        title='Reportes Semanales'
        titleTypographyProps={{ variant: 'h6' }}
        subheader='Estado de reportes de grupos'
        action={
          <Chip
            size='small'
            variant='tonal'
            color={allReported ? 'success' : 'warning'}
            label={`${reported}/${expected}`}
          />
        }
      />
      <CardContent>
        <Box className='mbe-4'>
          <Box className='flex justify-between mbe-2'>
            <Typography variant='body2' color='text.secondary'>
              Progreso semanal
            </Typography>
            <Typography variant='body2' fontWeight={600} color={allReported ? 'success.main' : 'warning.main'}>
              {percentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant='determinate'
            value={percentage}
            color={allReported ? 'success' : 'warning'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {allReported ? (
          <Box className='flex items-center gap-2 p-3 rounded-lg' sx={{ bgcolor: 'success.lighter' }}>
            <i className='solar-check-read-linear text-xl' style={{ color: 'var(--mui-palette-success-main)' }} />
            <Typography variant='body2' color='success.main' fontWeight={500}>
              Todos los grupos han reportado esta semana
            </Typography>
          </Box>
        ) : (
          <Box className='flex flex-col gap-2'>
            <Typography variant='caption' color='text.secondary' fontWeight={500}>
              Grupos pendientes:
            </Typography>
            {unreportedGroups.slice(0, 5).map(group => (
              <Box key={group.id} className='flex items-center gap-2'>
                <i className='solar-danger-triangle-linear text-base' style={{ color: 'var(--mui-palette-warning-main)' }} />
                <Typography variant='body2' noWrap className='flex-1'>
                  {group.name}
                </Typography>
                <Typography variant='caption' color='text.disabled'>
                  {DAYS_LABELS[group.meetingDay] || group.meetingDay}
                </Typography>
              </Box>
            ))}
            {unreportedGroups.length > 5 && (
              <Typography variant='caption' color='text.disabled'>
                y {unreportedGroups.length - 5} más...
              </Typography>
            )}
            <Button
              size='small'
              href='/dashboard/reportes/pendientes'
              sx={{ mt: 1, textTransform: 'none', p: 0, minWidth: 'auto' }}
              color='warning'
            >
              Ver reportes pendientes →
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

// Skeleton de carga
const LoadingSkeleton = () => (
  <Grid container spacing={6}>
    <Grid size={{ xs: 12, md: 8 }}>
      <Card>
        <CardContent>
          <Skeleton variant='rectangular' height={160} />
        </CardContent>
      </Card>
    </Grid>
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Card>
        <CardContent>
          <Skeleton variant='rectangular' height={160} />
        </CardContent>
      </Card>
    </Grid>
    {[1, 2, 3, 4].map(i => (
      <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
        <Card>
          <CardContent>
            <Skeleton variant='rectangular' height={120} />
          </CardContent>
        </Card>
      </Grid>
    ))}
    <Grid size={{ xs: 12, md: 4 }}>
      <Card>
        <CardContent>
          <Skeleton variant='rectangular' height={320} />
        </CardContent>
      </Card>
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <Card>
        <CardContent>
          <Skeleton variant='rectangular' height={320} />
        </CardContent>
      </Card>
    </Grid>
    <Grid size={{ xs: 12, md: 4 }}>
      <Card>
        <CardContent>
          <Skeleton variant='rectangular' height={320} />
        </CardContent>
      </Card>
    </Grid>
  </Grid>
)

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats()

        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar estadísticas')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <CustomAvatar skin='light' color='error' size={64} sx={{ mx: 'auto', mb: 2 }}>
            <i className='solar-danger-triangle-linear text-[32px]' />
          </CustomAvatar>
          <Typography variant='h6' color='error.main' className='mbe-2'>
            Error al cargar el dashboard
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {error}
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // Calcular tendencia
  const usersTrend =
    stats.newUsersLastMonth > 0
      ? ((stats.newUsersThisMonth - stats.newUsersLastMonth) / stats.newUsersLastMonth) * 100
      : stats.newUsersThisMonth > 0
        ? 100
        : 0

  return (
    <Grid container spacing={6}>
      {/* Tarjeta de bienvenida */}
      <Grid size={{ xs: 12, lg: 8 }}>
        <WelcomeCard userName={stats.currentUserName} stats={stats} />
      </Grid>

      {/* Resumen rápido */}
      <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
        <ProgressStatCard
          title='Miembros en Redes'
          value={stats.usersWithNetwork}
          total={stats.totalUsers}
          icon='solar-medal-star-linear'
          color='primary'
        />
      </Grid>

      {/* Cards de estadísticas */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title='Miembros Activos'
          value={stats.activeUsers}
          subtitle={`de ${stats.totalUsers} totales`}
          icon='solar-user-heart-linear'
          color='success'
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title='Nuevos Este Mes'
          value={stats.newUsersThisMonth}
          icon='solar-user-plus-linear'
          color='info'
          trend={usersTrend >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(Math.round(usersTrend))}%`}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title='Redes Activas'
          value={stats.activeNetworks}
          subtitle={`de ${stats.totalNetworks} totales`}
          icon='solar-share-circle-linear'
          color='warning'
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <StatCard
          title='Grupos Activos'
          value={stats.activeGroups}
          subtitle={`de ${stats.totalGroups} totales`}
          icon='solar-widget-2-linear'
          color='primary'
        />
      </Grid>

      {/* Sección de Eventos, Reuniones y Reportes */}
      <Grid size={{ xs: 12, md: 4 }}>
        <UpcomingEventsCard events={stats.upcomingEvents} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <UpcomingMeetingsCard groups={stats.upcomingGroups} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <WeeklyReportingCard stats={stats} />
      </Grid>

      {/* Sección inferior */}
      <Grid size={{ xs: 12, md: 4 }}>
        <TopNetworksCard networks={stats.topNetworks} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <DistributionCard stats={stats} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <RecentMembersCard users={stats.recentUsers} />
      </Grid>
    </Grid>
  )
}

export default Dashboard
