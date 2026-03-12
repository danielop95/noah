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

// Custom Components
import CustomAvatar from '@core/components/mui/Avatar'

type UserGroup = {
  id: string
  name: string
  network: { id: string; name: string } | null
  _count: { reports: number }
}

type ProfileData = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  image: string | null
  roleId: string | null
  userRole: { id: string; name: string; slug: string; hierarchy: number } | null
  phone: string | null
  city: string | null
  country: string | null
  isActive?: boolean
  networkRole: string | null
  groupRole: string | null
  network: { id: string; name: string; imageUrl?: string | null } | null
  organization: { id: string; name: string; logoUrl: string | null } | null
  group: UserGroup | null
  stats: {
    reportsCount: number
    groupsLeading: number
    totalAttendees: number
    totalVisitors: number
    avgAttendees: number
  }
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
  padding: theme.spacing(2, 3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'var(--mui-palette-action-hover)',
  flex: 1
}))

type Props = {
  profile: ProfileData
}

const ProfileOverview = ({ profile }: Props) => {
  const displayName = profile.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Sin nombre'

  const initials = displayName
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

  return (
    <Card>
      <CardContent className='flex flex-col items-center text-center pbs-10 pbe-6'>
        {/* Avatar */}
        <StyledAvatar src={profile.image || undefined} alt={displayName}>
          {initials}
        </StyledAvatar>

        {/* Nombre */}
        <Typography variant='h5' className='mbs-4 font-semibold'>
          {displayName}
        </Typography>

        {/* Chips de estado */}
        <Box className='flex gap-2 mbs-2'>
          <Chip
            label={profile.userRole?.name || 'Miembro'}
            color={profile.userRole && profile.userRole.hierarchy <= 2 ? 'primary' : 'secondary'}
            size='small'
          />
          {profile.isActive !== undefined && (
            <Chip
              label={profile.isActive ? 'Activo' : 'Inactivo'}
              color={profile.isActive ? 'success' : 'error'}
              size='small'
              variant='outlined'
            />
          )}
        </Box>
      </CardContent>

      <Divider />

      {/* Stats */}
      <CardContent className='pbs-4 pbe-4'>
        <Box className='flex gap-4'>
          <StatBox>
            <CustomAvatar skin='light' color='warning' size={40} variant='rounded'>
              <i className='ri-file-list-3-line text-xl' />
            </CustomAvatar>
            <Box>
              <Typography variant='h5' fontWeight={600}>
                {profile.stats.reportsCount}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Reportes
              </Typography>
            </Box>
          </StatBox>
          <StatBox>
            <CustomAvatar skin='light' color='success' size={40} variant='rounded'>
              <i className='ri-group-line text-xl' />
            </CustomAvatar>
            <Box>
              <Typography variant='h5' fontWeight={600}>
                {profile.stats.groupsLeading}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Grupos Liderados
              </Typography>
            </Box>
          </StatBox>
        </Box>
      </CardContent>

      <Divider />

      {/* Red */}
      <CardContent className='pbs-4 pbe-4'>
        <Typography variant='overline' color='text.disabled' className='mbe-3 block'>
          Mi Red
        </Typography>
        {profile.network ? (
          <Box className='flex items-center gap-3'>
            <CustomAvatar
              skin='light'
              color='primary'
              size={44}
              variant='rounded'
              src={profile.network.imageUrl || undefined}
            >
              <i className='ri-bubble-chart-line' />
            </CustomAvatar>
            <Box className='flex-1'>
              <Typography variant='body1' fontWeight={500}>
                {profile.network.name}
              </Typography>
              <Chip
                label={profile.networkRole === 'leader' ? 'Lider' : 'Miembro'}
                size='small'
                color={profile.networkRole === 'leader' ? 'warning' : 'default'}
                variant='tonal'
                icon={profile.networkRole === 'leader' ? <i className='ri-star-fill' /> : undefined}
                sx={{ height: 22, mt: 0.5 }}
              />
            </Box>
          </Box>
        ) : (
          <Box className='flex items-center gap-3'>
            <CustomAvatar skin='light' color='secondary' size={44} variant='rounded'>
              <i className='ri-bubble-chart-line' />
            </CustomAvatar>
            <Typography variant='body2' color='text.secondary'>
              No asignado
            </Typography>
          </Box>
        )}
      </CardContent>

      <Divider />

      {/* Grupo */}
      <CardContent className='pbs-4 pbe-4'>
        <Typography variant='overline' color='text.disabled' className='mbe-3 block'>
          Mi Grupo
        </Typography>
        {profile.group ? (
          <Box className='flex items-center gap-3'>
            <CustomAvatar skin='light' color='success' size={44} variant='rounded'>
              <i className='ri-team-line' />
            </CustomAvatar>
            <Box className='flex-1'>
              <Typography variant='body1' fontWeight={500}>
                {profile.group.name}
              </Typography>
              <Box className='flex items-center gap-2'>
                <Chip
                  label={profile.groupRole === 'leader' ? 'Lider' : 'Miembro'}
                  size='small'
                  color={profile.groupRole === 'leader' ? 'success' : 'default'}
                  variant='tonal'
                  icon={profile.groupRole === 'leader' ? <i className='ri-shield-star-line' /> : undefined}
                  sx={{ height: 22 }}
                />
                {profile.group._count.reports > 0 && (
                  <Typography variant='caption' color='text.secondary'>
                    {profile.group._count.reports} reportes
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box className='flex items-center gap-3'>
            <CustomAvatar skin='light' color='secondary' size={44} variant='rounded'>
              <i className='ri-team-line' />
            </CustomAvatar>
            <Typography variant='body2' color='text.secondary'>
              No asignado
            </Typography>
          </Box>
        )}
      </CardContent>

      <Divider />

      {/* Información de Contacto */}
      <CardContent className='pbs-4 pbe-4'>
        <Typography variant='overline' color='text.disabled' className='mbe-3 block'>
          Informacion de Contacto
        </Typography>
        <Box className='flex flex-col gap-3'>
          <Box className='flex items-center gap-3'>
            <CustomAvatar skin='light' color='info' size={32}>
              <i className='ri-mail-line text-base' />
            </CustomAvatar>
            <Typography variant='body2'>{profile.email || '-'}</Typography>
          </Box>
          <Box className='flex items-center gap-3'>
            <CustomAvatar skin='light' color='info' size={32}>
              <i className='ri-phone-line text-base' />
            </CustomAvatar>
            <Typography variant='body2'>{profile.phone || '-'}</Typography>
          </Box>
          {(profile.city || profile.country) && (
            <Box className='flex items-center gap-3'>
              <CustomAvatar skin='light' color='info' size={32}>
                <i className='ri-map-pin-line text-base' />
              </CustomAvatar>
              <Typography variant='body2'>
                {[profile.city, profile.country].filter(Boolean).join(', ')}
              </Typography>
            </Box>
          )}
          {profile.organization && (
            <Box className='flex items-center gap-3'>
              <CustomAvatar skin='light' color='info' size={32}>
                <i className='ri-building-line text-base' />
              </CustomAvatar>
              <Typography variant='body2'>{profile.organization.name}</Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default ProfileOverview
