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

type NetworkStats = {
  totalGroups: number
  activeGroups: number
  totalLeaders: number
  totalMembers: number
  totalUsers: number
  totalReports: number
  totalAttendees: number
  totalVisitors: number
  avgAttendees: number
  newMembersThisMonth: number
  memberGrowth: number
  reportsThisMonth: number
  groupsReportedThisMonth: number
  reportingPercentage: number
}

type NetworkData = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: Date
  stats: NetworkStats
}

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
  network: NetworkData
}

const NetworkProfileCard = ({ network }: Props) => {
  const { stats } = network

  return (
    <Card>
      <CardContent className='flex flex-col items-center text-center pbs-10 pbe-6'>
        {/* Avatar */}
        <StyledAvatar
          src={network.imageUrl || undefined}
          variant='rounded'
          sx={{ bgcolor: 'primary.main' }}
        >
          <i className='ri-bubble-chart-line text-4xl' />
        </StyledAvatar>

        {/* Nombre */}
        <Typography variant='h5' className='mbs-4 font-semibold'>
          {network.name}
        </Typography>

        {/* Estado */}
        <Chip
          label={network.isActive ? 'Activa' : 'Inactiva'}
          color={network.isActive ? 'success' : 'error'}
          size='small'
          className='mbs-2'
        />

        {/* Descripcion */}
        {network.description && (
          <Typography variant='body2' color='text.secondary' className='mbs-3 max-is-[280px]'>
            {network.description}
          </Typography>
        )}
      </CardContent>

      <Divider />

      {/* Estadisticas Principales */}
      <CardContent className='pbs-4 pbe-4'>
        <Typography variant='overline' color='text.disabled' className='mbe-3 block'>
          Estadisticas Clave
        </Typography>
        <Box className='flex flex-col gap-4'>
          {/* Crecimiento de Miembros */}
          <Box className='flex items-center gap-3'>
            <CustomAvatar
              skin='light'
              color={stats.memberGrowth >= 0 ? 'success' : 'error'}
              size={44}
              variant='rounded'
            >
              <i className={`ri-arrow-${stats.memberGrowth >= 0 ? 'up' : 'down'}-line text-xl`} />
            </CustomAvatar>
            <Box className='flex-1'>
              <Box className='flex items-center justify-between'>
                <Typography variant='body2' fontWeight={500}>
                  Crecimiento
                </Typography>
                <Typography
                  variant='body2'
                  fontWeight={600}
                  color={stats.memberGrowth >= 0 ? 'success.main' : 'error.main'}
                >
                  {stats.memberGrowth >= 0 ? '+' : ''}{stats.memberGrowth}%
                </Typography>
              </Box>
              <Typography variant='caption' color='text.secondary'>
                {stats.newMembersThisMonth} nuevos este mes
              </Typography>
            </Box>
          </Box>

          {/* Grupos */}
          <Box className='flex items-center gap-3'>
            <CustomAvatar skin='light' color='primary' size={44} variant='rounded'>
              <i className='ri-team-line text-xl' />
            </CustomAvatar>
            <Box className='flex-1'>
              <Box className='flex items-center justify-between'>
                <Typography variant='body2' fontWeight={500}>
                  Grupos
                </Typography>
                <Typography variant='body2' fontWeight={600}>
                  {stats.activeGroups}/{stats.totalGroups}
                </Typography>
              </Box>
              <Typography variant='caption' color='text.secondary'>
                activos
              </Typography>
            </Box>
          </Box>

          {/* Cumplimiento de Reportes */}
          <Box className='flex items-center gap-3'>
            <CustomAvatar
              skin='light'
              color={stats.reportingPercentage >= 80 ? 'success' : stats.reportingPercentage >= 50 ? 'warning' : 'error'}
              size={44}
              variant='rounded'
            >
              <i className='ri-file-chart-line text-xl' />
            </CustomAvatar>
            <Box className='flex-1'>
              <Box className='flex items-center justify-between mbe-1'>
                <Typography variant='body2' fontWeight={500}>
                  Cumplimiento
                </Typography>
                <Typography variant='body2' fontWeight={600}>
                  {stats.reportingPercentage}%
                </Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={stats.reportingPercentage}
                color={stats.reportingPercentage >= 80 ? 'success' : stats.reportingPercentage >= 50 ? 'warning' : 'error'}
                sx={{ height: 6, borderRadius: 3 }}
              />
              <Typography variant='caption' color='text.secondary'>
                {stats.groupsReportedThisMonth} de {stats.activeGroups} grupos reportaron
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>

      <Divider />

      {/* Resumen de Reportes */}
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
                {stats.avgAttendees}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Prom. Asist.
              </Typography>
            </Box>
          </StatBox>
        </Box>
      </CardContent>

      <Divider />

      {/* Miembros Totales */}
      <CardContent className='pbs-4 pbe-4'>
        <Typography variant='overline' color='text.disabled' className='mbe-3 block'>
          Miembros de la Red
        </Typography>
        <Box className='flex items-center justify-between'>
          <Box className='flex items-center gap-2'>
            <CustomAvatar skin='light' color='warning' size={32}>
              <i className='ri-star-fill text-base' />
            </CustomAvatar>
            <Box>
              <Typography variant='body2' fontWeight={500}>
                {stats.totalLeaders}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Lideres
              </Typography>
            </Box>
          </Box>
          <Box className='flex items-center gap-2'>
            <CustomAvatar skin='light' color='info' size={32}>
              <i className='ri-group-line text-base' />
            </CustomAvatar>
            <Box>
              <Typography variant='body2' fontWeight={500}>
                {stats.totalMembers}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Miembros
              </Typography>
            </Box>
          </Box>
          <Box className='flex items-center gap-2'>
            <CustomAvatar skin='light' color='secondary' size={32}>
              <i className='ri-user-line text-base' />
            </CustomAvatar>
            <Box>
              <Typography variant='body2' fontWeight={500}>
                {stats.totalUsers}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Total
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default NetworkProfileCard
