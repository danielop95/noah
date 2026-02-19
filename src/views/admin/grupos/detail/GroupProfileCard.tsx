'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import { styled } from '@mui/material/styles'

// Custom Components
import CustomAvatar from '@core/components/mui/Avatar'

import type { GroupFullDetails } from '@/app/server/groupActions'

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
  fontSize: '2rem'
}))

const StatBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'var(--mui-palette-action-hover)',
  flex: 1
}))

type Props = {
  group: GroupFullDetails
}

const getDayLabel = (day: string | null) => {
  const days: Record<string, string> = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  }

  return day ? days[day] || day : null
}

const formatDate = (date: Date | null) => {
  if (!date) return 'Sin reportes'

  return new Date(date).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

const GroupProfileCard = ({ group }: Props) => {
  const { stats } = group

  return (
    <Card>
      <CardContent className='flex flex-col items-center text-center pbs-10 pbe-6'>
        {/* Avatar */}
        <StyledAvatar
          src={group.imageUrl || undefined}
          variant='rounded'
          sx={{ bgcolor: 'grey.400', fontWeight: 600 }}
        >
          {getInitials(group.name)}
        </StyledAvatar>

        {/* Nombre */}
        <Typography variant='h5' className='mbs-4 font-semibold'>
          {group.name}
        </Typography>

        {/* Chips de estado y modalidad */}
        <Box className='flex gap-2 mbs-2'>
          <Chip
            label={group.isActive ? 'Activo' : 'Inactivo'}
            color={group.isActive ? 'success' : 'error'}
            size='small'
          />
          <Chip
            label={group.modality === 'virtual' ? 'Virtual' : 'Presencial'}
            color={group.modality === 'virtual' ? 'info' : 'primary'}
            variant='outlined'
            size='small'
          />
        </Box>

        {/* Descripcion */}
        {group.description && (
          <Typography variant='body2' color='text.secondary' className='mbs-3 max-is-[280px]'>
            {group.description}
          </Typography>
        )}
      </CardContent>

      <Divider />

      {/* Información de Reunión */}
      <CardContent className='pbs-4 pbe-4'>
        <Typography variant='overline' color='text.disabled' className='mbe-3 block'>
          Información de Reunión
        </Typography>
        <Box className='flex flex-col gap-2'>
          {getDayLabel(group.meetingDay) && (
            <Box className='flex items-center gap-2'>
              <CustomAvatar skin='light' color='primary' size={32} variant='rounded'>
                <i className='ri-calendar-line text-base' />
              </CustomAvatar>
              <Box>
                <Typography variant='body2' fontWeight={500}>
                  {getDayLabel(group.meetingDay)}
                </Typography>
                {group.meetingTime && (
                  <Typography variant='caption' color='text.secondary'>
                    {group.meetingTime}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
          {group.modality === 'presencial' && (group.city || group.address) && (
            <Box className='flex items-center gap-2'>
              <CustomAvatar skin='light' color='info' size={32} variant='rounded'>
                <i className='ri-map-pin-line text-base' />
              </CustomAvatar>
              <Box>
                <Typography variant='body2' fontWeight={500}>
                  {group.city || 'Sin ciudad'}
                </Typography>
                {group.address && (
                  <Typography variant='caption' color='text.secondary'>
                    {group.address}
                    {group.neighborhood && ` - ${group.neighborhood}`}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>

      <Divider />

      {/* Red */}
      <CardContent className='pbs-4 pbe-4'>
        <Typography variant='overline' color='text.disabled' className='mbe-3 block'>
          Red
        </Typography>
        <Box className='flex items-center gap-3'>
          <Avatar
            src={group.network.imageUrl || undefined}
            variant='rounded'
            sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
          >
            <i className='ri-bubble-chart-line' />
          </Avatar>
          <Typography variant='body1' fontWeight={500}>
            {group.network.name}
          </Typography>
        </Box>
      </CardContent>

      <Divider />

      {/* Estadísticas Clave */}
      <CardContent className='pbs-4 pbe-4'>
        <Typography variant='overline' color='text.disabled' className='mbe-3 block'>
          Estadísticas Clave
        </Typography>
        <Box className='flex flex-col gap-4'>
          {/* Crecimiento de Asistentes */}
          <Box className='flex items-center gap-3'>
            <CustomAvatar
              skin='light'
              color={stats.attendeesGrowth >= 0 ? 'success' : 'error'}
              size={44}
              variant='rounded'
            >
              <i className={`ri-arrow-${stats.attendeesGrowth >= 0 ? 'up' : 'down'}-line text-xl`} />
            </CustomAvatar>
            <Box className='flex-1'>
              <Box className='flex items-center justify-between'>
                <Typography variant='body2' fontWeight={500}>
                  Crecimiento
                </Typography>
                <Typography
                  variant='body2'
                  fontWeight={600}
                  color={stats.attendeesGrowth >= 0 ? 'success.main' : 'error.main'}
                >
                  {stats.attendeesGrowth >= 0 ? '+' : ''}{stats.attendeesGrowth}%
                </Typography>
              </Box>
              <Typography variant='caption' color='text.secondary'>
                Prom. asistentes vs mes anterior
              </Typography>
            </Box>
          </Box>

          {/* Promedio de Asistentes */}
          <Box className='flex items-center gap-3'>
            <CustomAvatar skin='light' color='primary' size={44} variant='rounded'>
              <i className='ri-group-line text-xl' />
            </CustomAvatar>
            <Box className='flex-1'>
              <Box className='flex items-center justify-between'>
                <Typography variant='body2' fontWeight={500}>
                  Prom. Asistentes
                </Typography>
                <Typography variant='body2' fontWeight={600}>
                  {stats.avgAttendees}
                </Typography>
              </Box>
              <Typography variant='caption' color='text.secondary'>
                {stats.avgAttendeesThisMonth} este mes
              </Typography>
            </Box>
          </Box>

          {/* Cumplimiento de Reportes */}
          <Box className='flex items-center gap-3'>
            <CustomAvatar
              skin='light'
              color={stats.reportsThisMonth > 0 ? 'success' : 'warning'}
              size={44}
              variant='rounded'
            >
              <i className='ri-file-chart-line text-xl' />
            </CustomAvatar>
            <Box className='flex-1'>
              <Box className='flex items-center justify-between'>
                <Typography variant='body2' fontWeight={500}>
                  Reportes este Mes
                </Typography>
                <Typography variant='body2' fontWeight={600}>
                  {stats.reportsThisMonth}
                </Typography>
              </Box>
              <Typography variant='caption' color='text.secondary'>
                Último: {formatDate(stats.lastReportDate)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>

      <Divider />

      {/* Resumen Total */}
      <CardContent className='pbs-4 pbe-4'>
        <Typography variant='overline' color='text.disabled' className='mbe-3 block'>
          Actividad Total
        </Typography>
        <Box className='flex gap-4'>
          <StatBox>
            <CustomAvatar skin='light' color='info' size={40} variant='rounded'>
              <i className='ri-file-list-3-line text-lg' />
            </CustomAvatar>
            <Box>
              <Typography variant='h6' fontWeight={600}>
                {stats.totalReports}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Reportes
              </Typography>
            </Box>
          </StatBox>
          <StatBox>
            <CustomAvatar skin='light' color='success' size={40} variant='rounded'>
              <i className='ri-user-follow-line text-lg' />
            </CustomAvatar>
            <Box>
              <Typography variant='h6' fontWeight={600}>
                {stats.totalVisitors}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Visitas
              </Typography>
            </Box>
          </StatBox>
        </Box>
      </CardContent>
    </Card>
  )
}

export default GroupProfileCard
