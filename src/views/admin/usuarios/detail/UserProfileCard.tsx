'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'

// Custom Components
import CustomAvatar from '@core/components/mui/Avatar'

type GroupLeadership = {
  group: {
    id: string
    name: string
    network: { id: string; name: string } | null
    leaders: Array<{
      user: { id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null }
    }>
    _count: { reports: number }
  }
}

type UserData = {
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
  gender: string | null
  birthDate: Date | null
  maritalStatus: string | null
  documentType: string | null
  documentNumber: string | null
  isActive: boolean
  networkRole: string | null
  network: { id: string; name: string; imageUrl?: string | null } | null
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
  width: 100,
  height: 100,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: theme.shadows[3],
  fontSize: '2rem'
}))

type Props = {
  user: UserData
  onEdit: () => void
}

const UserProfileCard = ({ user, onEdit }: Props) => {
  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre'

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
        <StyledAvatar src={user.image || undefined} alt={displayName}>
          {initials}
        </StyledAvatar>

        {/* Nombre */}
        <Typography variant='h5' className='mbs-4 font-semibold'>
          {displayName}
        </Typography>

        {/* Chips de estado */}
        <Box className='flex gap-2 mbs-2'>
          <Chip
            label={user.role === 'admin' ? 'Administrador' : 'Miembro'}
            color={user.role === 'admin' ? 'primary' : 'secondary'}
            size='small'
          />
          <Chip
            label={user.isActive ? 'Activo' : 'Inactivo'}
            color={user.isActive ? 'success' : 'error'}
            size='small'
            variant='outlined'
          />
        </Box>
      </CardContent>

      <Divider />

      {/* Red */}
      <CardContent className='pbs-4 pbe-4'>
        <Typography variant='overline' color='text.disabled' className='mbe-3 block'>
          Mi Red
        </Typography>
        {user.network ? (
          <Box className='flex items-center gap-3'>
            <CustomAvatar
              skin='light'
              color='primary'
              size={44}
              variant='rounded'
              src={user.network.imageUrl || undefined}
            >
              <i className='ri-bubble-chart-line' />
            </CustomAvatar>
            <Box className='flex-1'>
              <Typography variant='body1' fontWeight={500}>
                {user.network.name}
              </Typography>
              <Chip
                label={user.networkRole === 'leader' ? 'Lider' : 'Miembro'}
                size='small'
                color={user.networkRole === 'leader' ? 'warning' : 'default'}
                variant='tonal'
                icon={user.networkRole === 'leader' ? <i className='ri-star-fill' /> : undefined}
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
        {user.groupLeaderships.length > 0 ? (
          <Box className='flex flex-col gap-3'>
            {user.groupLeaderships.map(({ group }) => (
              <Box key={group.id} className='flex items-center gap-3'>
                <CustomAvatar skin='light' color='success' size={44} variant='rounded'>
                  <i className='ri-team-line' />
                </CustomAvatar>
                <Box className='flex-1'>
                  <Typography variant='body1' fontWeight={500}>
                    {group.name}
                  </Typography>
                  <Box className='flex items-center gap-2'>
                    <Chip
                      label='Lider'
                      size='small'
                      color='success'
                      variant='tonal'
                      icon={<i className='ri-shield-star-line' />}
                      sx={{ height: 22 }}
                    />
                    {group._count.reports > 0 && (
                      <Typography variant='caption' color='text.secondary'>
                        {group._count.reports} reportes
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            ))}
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
            <Typography variant='body2'>{user.email || '-'}</Typography>
          </Box>
          <Box className='flex items-center gap-3'>
            <CustomAvatar skin='light' color='info' size={32}>
              <i className='ri-phone-line text-base' />
            </CustomAvatar>
            <Typography variant='body2'>{user.phone || '-'}</Typography>
          </Box>
          {(user.city || user.country) && (
            <Box className='flex items-center gap-3'>
              <CustomAvatar skin='light' color='info' size={32}>
                <i className='ri-map-pin-line text-base' />
              </CustomAvatar>
              <Typography variant='body2'>
                {[user.city, user.country].filter(Boolean).join(', ')}
              </Typography>
            </Box>
          )}
          {user.organization && (
            <Box className='flex items-center gap-3'>
              <CustomAvatar skin='light' color='info' size={32}>
                <i className='ri-building-line text-base' />
              </CustomAvatar>
              <Typography variant='body2'>{user.organization.name}</Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      <Divider />

      {/* Accion */}
      <CardContent className='pbs-4'>
        <Button
          variant='contained'
          fullWidth
          startIcon={<i className='ri-edit-line' />}
          onClick={onEdit}
        >
          Editar Usuario
        </Button>
      </CardContent>
    </Card>
  )
}

export default UserProfileCard
