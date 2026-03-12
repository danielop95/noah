'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

// Component Imports
import CustomAvatar from '@core/components/mui/Avatar'

type Props = {
  user: {
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    image: string | null
    isActive: boolean
    createdAt: Date
    city: string | null
    country: string | null
    userRole: { id: string; name: string; slug: string; hierarchy: number } | null
    networkRole: string | null
    groupRole: string | null
    network: { id: string; name: string } | null
    group: { id: string; name: string } | null
  }
  onEdit: () => void
  onBack: () => void
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

const getCountryName = (code: string | null) => {
  const countries: Record<string, string> = {
    CO: 'Colombia', VE: 'Venezuela', EC: 'Ecuador',
    PE: 'Peru', MX: 'Mexico', AR: 'Argentina'
  }

  return code ? countries[code] || code : null
}

const ProfileHeader = ({ user, onEdit, onBack }: Props) => {
  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre'

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })

  const location = [user.city, getCountryName(user.country)].filter(Boolean).join(', ')

  return (
    <Card>
      {/* Cover gradient */}
      <Box
        className='bs-[200px] relative'
        sx={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)'
        }}
      >
        {/* Back button */}
        <IconButton
          onClick={onBack}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.15)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
          }}
        >
          <i className='ri-arrow-left-line' />
        </IconButton>
        {/* Edit button */}
        <Button
          variant='contained'
          color='inherit'
          startIcon={<i className='ri-edit-line' />}
          onClick={onEdit}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'rgba(255,255,255,0.2)',
            color: 'white',
            backdropFilter: 'blur(8px)',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
          }}
        >
          Editar
        </Button>
        {/* Decorative pattern */}
        <div
          className='absolute inset-0 opacity-10 pointer-events-none'
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
      </Box>

      <CardContent className='flex gap-6 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        {/* Avatar overlapping cover */}
        <div className='flex rounded-bs-md mbs-[-55px] border-[5px] border-backgroundPaper bg-backgroundPaper rounded-lg'>
          {user.image ? (
            <img
              height={110}
              width={110}
              src={user.image}
              className='rounded-lg object-cover'
              alt={displayName}
            />
          ) : (
            <CustomAvatar
              skin='light'
              color='primary'
              size={110}
              variant='rounded'
              sx={{ fontSize: '2.5rem', fontWeight: 600 }}
            >
              {getInitials(displayName)}
            </CustomAvatar>
          )}
        </div>

        {/* Profile info */}
        <div className='flex is-full flex-wrap justify-center flex-col items-center sm:flex-row sm:justify-between sm:items-end gap-5 pbe-2'>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <div className='flex items-center gap-3'>
              <Typography variant='h4'>{displayName}</Typography>
              <Chip
                label={user.isActive ? 'Activo' : 'Inactivo'}
                color={user.isActive ? 'success' : 'error'}
                size='small'
                variant='tonal'
              />
            </div>
            <div className='flex flex-wrap gap-5 justify-center sm:justify-normal'>
              {user.userRole && (
                <div className='flex items-center gap-1.5'>
                  <i className='ri-shield-star-line text-textSecondary' />
                  <Typography className='font-medium' color='text.secondary'>
                    {user.userRole.name}
                  </Typography>
                </div>
              )}
              {location && (
                <div className='flex items-center gap-1.5'>
                  <i className='ri-map-pin-2-line text-textSecondary' />
                  <Typography className='font-medium' color='text.secondary'>
                    {location}
                  </Typography>
                </div>
              )}
              <div className='flex items-center gap-1.5'>
                <i className='ri-calendar-line text-textSecondary' />
                <Typography className='font-medium' color='text.secondary'>
                  Miembro desde {formatDate(user.createdAt)}
                </Typography>
              </div>
            </div>
            {/* Quick assignment chips */}
            <div className='flex flex-wrap gap-2 mbs-1'>
              {user.network ? (
                <Chip
                  icon={user.networkRole === 'leader' ? <i className='ri-star-fill' /> : <i className='ri-bubble-chart-line' />}
                  label={`${user.network.name}${user.networkRole === 'leader' ? ' (Lider)' : ''}`}
                  color={user.networkRole === 'leader' ? 'warning' : 'info'}
                  variant='tonal'
                  size='small'
                />
              ) : (
                <Chip label='Sin red' variant='outlined' size='small' color='secondary' />
              )}
              {user.group ? (
                <Chip
                  icon={user.groupRole === 'leader' ? <i className='ri-star-fill' /> : <i className='ri-team-line' />}
                  label={`${user.group.name}${user.groupRole === 'leader' ? ' (Lider)' : ''}`}
                  color={user.groupRole === 'leader' ? 'success' : 'primary'}
                  variant='tonal'
                  size='small'
                />
              ) : (
                <Chip label='Sin grupo' variant='outlined' size='small' color='secondary' />
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProfileHeader
