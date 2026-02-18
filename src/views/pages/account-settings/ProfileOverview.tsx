'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'

// Type Imports
import type { ThemeColor } from '@core/types'

type GroupLeadership = {
  group: {
    id: string
    name: string
    network: { id: string; name: string } | null
    _count: { reports: number }
  }
}

type ProfileData = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  image: string | null
  role: string | null
  phone: string | null
  city: string | null
  country: string | null
  networkRole: string | null
  network: { id: string; name: string } | null
  organization: { id: string; name: string; logoUrl: string | null } | null
  groupLeaderships: GroupLeadership[]
  stats: {
    reportsCount: number
    groupsLeading: number
    totalAttendees: number
    totalVisitors: number
    avgAttendees: number
  }
}

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[4]
}))

const StatBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'var(--mui-palette-action-hover)'
}))

const StatAvatar = styled(Avatar)<{ color: ThemeColor }>(({ theme, color }) => ({
  width: 40,
  height: 40,
  backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
  color: `var(--mui-palette-${color}-main)`
}))

type Props = {
  profile: ProfileData
}

const ProfileOverview = ({ profile }: Props) => {
  const displayName = profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Sin nombre'

  return (
    <Card>
      <CardContent className='flex flex-col items-center gap-6 pbs-12'>
        {/* Avatar y Nombre */}
        <div className='flex flex-col items-center gap-4'>
          <StyledAvatar
            src={profile.image || undefined}
            alt={displayName}
          >
            {displayName.charAt(0).toUpperCase()}
          </StyledAvatar>
          <div className='text-center'>
            <Typography variant='h5' className='font-semibold'>
              {displayName}
            </Typography>
            <Chip
              label={profile.role === 'admin' ? 'Administrador' : 'Usuario'}
              color={profile.role === 'admin' ? 'primary' : 'secondary'}
              size='small'
              variant='tonal'
              className='mbs-2'
            />
          </div>
        </div>

        {/* Stats */}
        <div className='flex items-center justify-around flex-wrap gap-4 w-full'>
          <StatBox>
            <StatAvatar color='primary'>
              <i className='ri-file-list-3-line text-xl' />
            </StatAvatar>
            <div>
              <Typography variant='h5'>{profile.stats.reportsCount}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Reportes
              </Typography>
            </div>
          </StatBox>
          <StatBox>
            <StatAvatar color='success'>
              <i className='ri-group-line text-xl' />
            </StatAvatar>
            <div>
              <Typography variant='h5'>{profile.stats.groupsLeading}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Grupos Liderados
              </Typography>
            </div>
          </StatBox>
        </div>

        {/* Red */}
        {profile.network && (
          <>
            <Divider className='w-full' />
            <div className='w-full'>
              <Typography variant='subtitle2' color='text.secondary' className='mbe-2'>
                Mi Red
              </Typography>
              <div className='flex items-center gap-3'>
                <Avatar
                  variant='rounded'
                  sx={{ width: 44, height: 44, bgcolor: 'primary.main' }}
                >
                  <i className='ri-bubble-chart-line' />
                </Avatar>
                <div className='flex-1'>
                  <Typography className='font-medium'>{profile.network.name}</Typography>
                  <Chip
                    label={profile.networkRole === 'leader' ? 'Líder' : 'Miembro'}
                    size='small'
                    color={profile.networkRole === 'leader' ? 'warning' : 'info'}
                    variant='tonal'
                    icon={profile.networkRole === 'leader' ? <i className='ri-star-fill text-xs' /> : undefined}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Grupos que lidera */}
        {profile.groupLeaderships.length > 0 && (
          <>
            <Divider className='w-full' />
            <div className='w-full'>
              <Typography variant='subtitle2' color='text.secondary' className='mbe-2'>
                Grupos que Lidero
              </Typography>
              <div className='flex flex-col gap-2'>
                {profile.groupLeaderships.map(({ group }) => (
                  <div key={group.id} className='flex items-center gap-3 p-2 rounded bg-actionHover'>
                    <Avatar
                      variant='rounded'
                      sx={{ width: 36, height: 36, bgcolor: 'success.main' }}
                    >
                      <i className='ri-team-line text-sm' />
                    </Avatar>
                    <div className='flex-1'>
                      <Typography variant='body2' className='font-medium'>
                        {group.name}
                      </Typography>
                      {group.network && (
                        <Typography variant='caption' color='text.secondary'>
                          {group.network.name}
                        </Typography>
                      )}
                    </div>
                    <Chip
                      label={`${group._count.reports} reportes`}
                      size='small'
                      variant='outlined'
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Detalles */}
        <Divider className='w-full' />
        <div className='w-full'>
          <Typography variant='subtitle2' color='text.secondary' className='mbe-3'>
            Información de Contacto
          </Typography>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <i className='ri-mail-line text-textSecondary' />
              <Typography variant='body2'>{profile.email}</Typography>
            </div>
            {profile.phone && (
              <div className='flex items-center gap-2'>
                <i className='ri-phone-line text-textSecondary' />
                <Typography variant='body2'>{profile.phone}</Typography>
              </div>
            )}
            {(profile.city || profile.country) && (
              <div className='flex items-center gap-2'>
                <i className='ri-map-pin-line text-textSecondary' />
                <Typography variant='body2'>
                  {[profile.city, profile.country].filter(Boolean).join(', ')}
                </Typography>
              </div>
            )}
            {profile.organization && (
              <div className='flex items-center gap-2'>
                <i className='ri-building-line text-textSecondary' />
                <Typography variant='body2'>{profile.organization.name}</Typography>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileOverview
