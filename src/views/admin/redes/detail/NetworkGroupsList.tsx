'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import Grid from '@mui/material/Grid'
import { styled } from '@mui/material/styles'

type GroupLeader = {
  user: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    image: string | null
  }
}

type GroupData = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  modality: string | null
  city: string | null
  meetingDay: string | null
  meetingTime: string | null
  leaders: GroupLeader[]
  _count: { reports: number }
}

type Props = {
  groups: GroupData[]
}

const GroupCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)'
  }
}))

const getDisplayName = (user: GroupLeader['user']) =>
  user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre'

const getDayLabel = (day: string | null) => {
  const days: Record<string, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  }

  return day ? days[day] || day : '-'
}

const formatTime = (time: string | null) => {
  if (!time) return '-'

  // Si ya está formateado con AM/PM
  if (time.includes('AM') || time.includes('PM')) return time

  // Convertir formato 24h a 12h
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12

  return `${h12}:${minutes} ${ampm}`
}

const NetworkGroupsList = ({ groups }: Props) => {
  if (groups.length === 0) {
    return (
      <Card>
        <CardHeader title='Grupos de la Red' />
        <CardContent>
          <Box className='flex flex-col items-center justify-center py-8'>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'action.hover', mb: 2 }}>
              <i className='ri-team-line text-3xl text-textSecondary' />
            </Avatar>
            <Typography color='text.secondary'>
              Esta red no tiene grupos asignados
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        title='Grupos de la Red'
        subheader={`${groups.length} grupo${groups.length !== 1 ? 's' : ''}`}
      />
      <CardContent>
        <Grid container spacing={4}>
          {groups.map(group => (
            <Grid key={group.id} size={{ xs: 12, sm: 6 }}>
              <GroupCard variant='outlined'>
                <CardContent>
                  <div className='flex items-start gap-3'>
                    <Avatar
                      src={group.imageUrl || undefined}
                      variant='rounded'
                      sx={{ width: 56, height: 56, bgcolor: 'success.main' }}
                    >
                      <i className='ri-team-line text-2xl' />
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between gap-2 flex-wrap'>
                        <Typography variant='subtitle1' className='font-semibold'>
                          {group.name}
                        </Typography>
                        <div className='flex gap-1'>
                          <Chip
                            label={group.isActive ? 'Activo' : 'Inactivo'}
                            size='small'
                            color={group.isActive ? 'success' : 'error'}
                            variant='tonal'
                          />
                          {group.modality && (
                            <Chip
                              label={group.modality === 'virtual' ? 'Virtual' : 'Presencial'}
                              size='small'
                              variant='outlined'
                            />
                          )}
                        </div>
                      </div>
                      {group.description && (
                        <Typography variant='body2' color='text.secondary' className='line-clamp-2 mbs-1'>
                          {group.description}
                        </Typography>
                      )}
                    </div>
                  </div>

                  <Box className='flex flex-wrap gap-3 mbs-4'>
                    {group.meetingDay && (
                      <div className='flex items-center gap-1'>
                        <i className='ri-calendar-line text-textSecondary text-sm' />
                        <Typography variant='caption' color='text.secondary'>
                          {getDayLabel(group.meetingDay)}
                        </Typography>
                      </div>
                    )}
                    {group.meetingTime && (
                      <div className='flex items-center gap-1'>
                        <i className='ri-time-line text-textSecondary text-sm' />
                        <Typography variant='caption' color='text.secondary'>
                          {formatTime(group.meetingTime)}
                        </Typography>
                      </div>
                    )}
                    {group.city && (
                      <div className='flex items-center gap-1'>
                        <i className='ri-map-pin-line text-textSecondary text-sm' />
                        <Typography variant='caption' color='text.secondary'>
                          {group.city}
                        </Typography>
                      </div>
                    )}
                  </Box>

                  <Box className='flex items-center justify-between mbs-3 pt-3 border-t border-divider'>
                    <div className='flex items-center gap-2'>
                      <Typography variant='caption' color='text.secondary'>
                        Líderes:
                      </Typography>
                      {group.leaders.length > 0 ? (
                        <Tooltip
                          title={
                            <div>
                              {group.leaders.map(l => (
                                <div key={l.user.id}>{getDisplayName(l.user)}</div>
                              ))}
                            </div>
                          }
                        >
                          <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
                            {group.leaders.map(l => (
                              <Avatar key={l.user.id} src={l.user.image || undefined} sx={{ width: 24, height: 24 }}>
                                {getDisplayName(l.user).charAt(0)}
                              </Avatar>
                            ))}
                          </AvatarGroup>
                        </Tooltip>
                      ) : (
                        <Typography variant='caption' color='text.secondary'>-</Typography>
                      )}
                    </div>
                    <Chip
                      icon={<i className='ri-file-list-3-line text-xs' />}
                      label={`${group._count.reports} reportes`}
                      size='small'
                      variant='tonal'
                      color='primary'
                    />
                  </Box>
                </CardContent>
              </GroupCard>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default NetworkGroupsList
