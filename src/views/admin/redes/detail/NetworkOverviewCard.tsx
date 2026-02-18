'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'

// Type Imports
import type { ThemeColor } from '@core/types'

type NetworkUser = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  image: string | null
  phone: string | null
  networkRole: string | null
  isActive: boolean
}

type NetworkData = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: Date
  users: NetworkUser[]
  stats: {
    totalGroups: number
    totalLeaders: number
    totalMembers: number
    totalReports: number
    totalAttendees: number
    totalVisitors: number
    avgAttendees: number
  }
}

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[4]
}))

const StatBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'var(--mui-palette-action-hover)'
}))

const StatAvatar = styled(Avatar)<{ color: ThemeColor }>(({ color }) => ({
  width: 48,
  height: 48,
  marginBottom: 8,
  backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
  color: `var(--mui-palette-${color}-main)`
}))

type Props = {
  network: NetworkData
}

const getDisplayName = (user: NetworkUser) =>
  user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Sin nombre'

const NetworkOverviewCard = ({ network }: Props) => {
  const leaders = network.users.filter(u => u.networkRole === 'leader')
  const members = network.users.filter(u => u.networkRole === 'member')

  return (
    <Card>
      <CardContent className='flex flex-col items-center gap-6 pbs-12'>
        {/* Avatar y Nombre */}
        <div className='flex flex-col items-center gap-4'>
          <StyledAvatar
            src={network.imageUrl || undefined}
            variant='rounded'
            sx={{ bgcolor: 'primary.main' }}
          >
            <i className='ri-bubble-chart-line text-4xl' />
          </StyledAvatar>
          <div className='text-center'>
            <Typography variant='h5' className='font-semibold'>
              {network.name}
            </Typography>
            <Chip
              label={network.isActive ? 'Activa' : 'Inactiva'}
              color={network.isActive ? 'success' : 'error'}
              size='small'
              variant='tonal'
              className='mbs-2'
            />
          </div>
          {network.description && (
            <Typography variant='body2' color='text.secondary' className='text-center max-is-[300px]'>
              {network.description}
            </Typography>
          )}
        </div>

        {/* Stats principales */}
        <div className='flex items-center justify-around flex-wrap gap-4 w-full'>
          <StatBox>
            <StatAvatar color='primary'>
              <i className='ri-team-line text-xl' />
            </StatAvatar>
            <Typography variant='h5'>{network.stats.totalGroups}</Typography>
            <Typography variant='caption' color='text.secondary'>
              Grupos
            </Typography>
          </StatBox>
          <StatBox>
            <StatAvatar color='warning'>
              <i className='ri-star-line text-xl' />
            </StatAvatar>
            <Typography variant='h5'>{network.stats.totalLeaders}</Typography>
            <Typography variant='caption' color='text.secondary'>
              Líderes
            </Typography>
          </StatBox>
          <StatBox>
            <StatAvatar color='info'>
              <i className='ri-group-line text-xl' />
            </StatAvatar>
            <Typography variant='h5'>{network.stats.totalMembers}</Typography>
            <Typography variant='caption' color='text.secondary'>
              Miembros
            </Typography>
          </StatBox>
        </div>

        {/* Stats de reportes */}
        <Divider className='w-full' />
        <div className='w-full'>
          <Typography variant='subtitle2' color='text.secondary' className='mbe-3'>
            Estadísticas de Reportes
          </Typography>
          <div className='flex flex-wrap gap-4 justify-around'>
            <div className='text-center'>
              <Typography variant='h6' color='primary.main'>{network.stats.totalReports}</Typography>
              <Typography variant='caption' color='text.secondary'>Reportes</Typography>
            </div>
            <div className='text-center'>
              <Typography variant='h6' color='success.main'>{network.stats.totalAttendees}</Typography>
              <Typography variant='caption' color='text.secondary'>Asistentes</Typography>
            </div>
            <div className='text-center'>
              <Typography variant='h6' color='warning.main'>{network.stats.totalVisitors}</Typography>
              <Typography variant='caption' color='text.secondary'>Visitas</Typography>
            </div>
            <div className='text-center'>
              <Typography variant='h6' color='info.main'>{network.stats.avgAttendees}</Typography>
              <Typography variant='caption' color='text.secondary'>Promedio</Typography>
            </div>
          </div>
        </div>

        {/* Líderes */}
        {leaders.length > 0 && (
          <>
            <Divider className='w-full' />
            <div className='w-full'>
              <Typography variant='subtitle2' color='text.secondary' className='mbe-3'>
                Líderes de Red
              </Typography>
              <div className='flex flex-col gap-2'>
                {leaders.map(leader => (
                  <div key={leader.id} className='flex items-center gap-3 p-2 rounded bg-actionHover'>
                    <Avatar src={leader.image || undefined} sx={{ width: 36, height: 36 }}>
                      {getDisplayName(leader).charAt(0)}
                    </Avatar>
                    <div className='flex-1'>
                      <Typography variant='body2' className='font-medium'>
                        {getDisplayName(leader)}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {leader.email}
                      </Typography>
                    </div>
                    <Chip
                      icon={<i className='ri-star-fill text-xs' />}
                      label='Líder'
                      size='small'
                      color='warning'
                      variant='tonal'
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Miembros */}
        {members.length > 0 && (
          <>
            <Divider className='w-full' />
            <div className='w-full'>
              <Typography variant='subtitle2' color='text.secondary' className='mbe-2'>
                Miembros ({members.length})
              </Typography>
              <Tooltip
                title={
                  <div>
                    {members.map(m => (
                      <div key={m.id}>{getDisplayName(m)}</div>
                    ))}
                  </div>
                }
              >
                <AvatarGroup max={8} sx={{ justifyContent: 'flex-start' }}>
                  {members.map(member => (
                    <Avatar key={member.id} src={member.image || undefined} sx={{ width: 32, height: 32 }}>
                      {getDisplayName(member).charAt(0)}
                    </Avatar>
                  ))}
                </AvatarGroup>
              </Tooltip>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default NetworkOverviewCard
