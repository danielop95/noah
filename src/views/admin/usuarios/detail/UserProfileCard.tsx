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

// Type Imports
import type { ThemeColor } from '@core/types'

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

const StatAvatar = styled(Avatar)<{ color: ThemeColor }>(({ color }) => ({
  width: 40,
  height: 40,
  backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
  color: `var(--mui-palette-${color}-main)`
}))

type Props = {
  user: UserData
  onEdit: () => void
}

const UserProfileCard = ({ user, onEdit }: Props) => {
  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre'

  const getGenderLabel = (gender: string | null) => {
    switch (gender) {
      case 'male': return 'Masculino'
      case 'female': return 'Femenino'
      case 'other': return 'Otro'
      default: return '-'
    }
  }

  const getMaritalStatusLabel = (status: string | null) => {
    switch (status) {
      case 'single': return 'Soltero/a'
      case 'married': return 'Casado/a'
      case 'divorced': return 'Divorciado/a'
      case 'widowed': return 'Viudo/a'
      case 'commonLaw': return 'Unión Libre'
      default: return '-'
    }
  }

  return (
    <Card>
      <CardContent className='flex flex-col items-center gap-6 pbs-12'>
        {/* Avatar y Nombre */}
        <div className='flex flex-col items-center gap-4'>
          <StyledAvatar
            src={user.image || undefined}
            alt={displayName}
          >
            {displayName.charAt(0).toUpperCase()}
          </StyledAvatar>
          <div className='text-center'>
            <Typography variant='h5' className='font-semibold'>
              {displayName}
            </Typography>
            <div className='flex gap-2 justify-center mbs-2'>
              <Chip
                label={user.role === 'admin' ? 'Administrador' : 'Usuario'}
                color={user.role === 'admin' ? 'primary' : 'secondary'}
                size='small'
                variant='tonal'
              />
              <Chip
                label={user.isActive ? 'Activo' : 'Inactivo'}
                color={user.isActive ? 'success' : 'error'}
                size='small'
                variant='tonal'
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className='flex items-center justify-around flex-wrap gap-4 w-full'>
          <StatBox>
            <StatAvatar color='primary'>
              <i className='ri-file-list-3-line text-xl' />
            </StatAvatar>
            <div>
              <Typography variant='h5'>{user.stats.reportsCount}</Typography>
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
              <Typography variant='h5'>{user.stats.groupsLeading}</Typography>
              <Typography variant='body2' color='text.secondary'>
                Grupos Liderados
              </Typography>
            </div>
          </StatBox>
        </div>

        {/* Stats adicionales */}
        {user.stats.reportsCount > 0 && (
          <div className='flex flex-wrap gap-4 w-full justify-center'>
            <div className='text-center p-2'>
              <Typography variant='h6' color='info.main'>{user.stats.totalAttendees}</Typography>
              <Typography variant='caption' color='text.secondary'>Total Asistentes</Typography>
            </div>
            <div className='text-center p-2'>
              <Typography variant='h6' color='warning.main'>{user.stats.totalVisitors}</Typography>
              <Typography variant='caption' color='text.secondary'>Total Visitas</Typography>
            </div>
            <div className='text-center p-2'>
              <Typography variant='h6' color='success.main'>{user.stats.avgAttendees}</Typography>
              <Typography variant='caption' color='text.secondary'>Prom. Asistencia</Typography>
            </div>
          </div>
        )}

        {/* Red */}
        {user.network && (
          <>
            <Divider className='w-full' />
            <div className='w-full'>
              <Typography variant='subtitle2' color='text.secondary' className='mbe-2'>
                Red Asignada
              </Typography>
              <div className='flex items-center gap-3'>
                <Avatar
                  variant='rounded'
                  sx={{ width: 44, height: 44, bgcolor: 'primary.main' }}
                >
                  <i className='ri-bubble-chart-line' />
                </Avatar>
                <div className='flex-1'>
                  <Typography className='font-medium'>{user.network.name}</Typography>
                  <Chip
                    label={user.networkRole === 'leader' ? 'Líder' : 'Miembro'}
                    size='small'
                    color={user.networkRole === 'leader' ? 'warning' : 'info'}
                    variant='tonal'
                    icon={user.networkRole === 'leader' ? <i className='ri-star-fill text-xs' /> : undefined}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Grupos que lidera */}
        {user.groupLeaderships.length > 0 && (
          <>
            <Divider className='w-full' />
            <div className='w-full'>
              <Typography variant='subtitle2' color='text.secondary' className='mbe-2'>
                Grupos que Lidera
              </Typography>
              <div className='flex flex-col gap-2'>
                {user.groupLeaderships.map(({ group }) => (
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

        {/* Detalles personales */}
        <Divider className='w-full' />
        <div className='w-full'>
          <Typography variant='subtitle2' color='text.secondary' className='mbe-3'>
            Información Personal
          </Typography>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2'>
              <i className='ri-mail-line text-textSecondary' />
              <Typography variant='body2'>{user.email}</Typography>
            </div>
            {user.phone && (
              <div className='flex items-center gap-2'>
                <i className='ri-phone-line text-textSecondary' />
                <Typography variant='body2'>{user.phone}</Typography>
              </div>
            )}
            {user.gender && (
              <div className='flex items-center gap-2'>
                <i className='ri-user-line text-textSecondary' />
                <Typography variant='body2'>{getGenderLabel(user.gender)}</Typography>
              </div>
            )}
            {user.maritalStatus && (
              <div className='flex items-center gap-2'>
                <i className='ri-heart-line text-textSecondary' />
                <Typography variant='body2'>{getMaritalStatusLabel(user.maritalStatus)}</Typography>
              </div>
            )}
            {user.documentType && user.documentNumber && (
              <div className='flex items-center gap-2'>
                <i className='ri-id-card-line text-textSecondary' />
                <Typography variant='body2'>{user.documentType}: {user.documentNumber}</Typography>
              </div>
            )}
            {(user.city || user.country) && (
              <div className='flex items-center gap-2'>
                <i className='ri-map-pin-line text-textSecondary' />
                <Typography variant='body2'>
                  {[user.city, user.country].filter(Boolean).join(', ')}
                </Typography>
              </div>
            )}
            {user.organization && (
              <div className='flex items-center gap-2'>
                <i className='ri-building-line text-textSecondary' />
                <Typography variant='body2'>{user.organization.name}</Typography>
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className='flex gap-4 w-full'>
          <Button
            variant='contained'
            fullWidth
            startIcon={<i className='ri-edit-line' />}
            onClick={onEdit}
          >
            Editar Usuario
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfileCard
