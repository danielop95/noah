'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import { styled } from '@mui/material/styles'

// Custom Components
import CustomAvatar from '@core/components/mui/Avatar'

type GroupLeader = {
  user: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    image: string | null
    email: string | null
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
  networkId: string
}

const GroupCard = styled(Card)(({ theme }) => ({
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)'
  }
}))

const getDisplayName = (user: GroupLeader['user']) =>
  user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre'

const getDayLabel = (day: string | null) => {
  const days: Record<string, string> = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miercoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sabado',
    domingo: 'Domingo'
  }

  return day ? days[day] || day : null
}

const NetworkGroupsTab = ({ groups, networkId }: Props) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, group: GroupData) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
    setSelectedGroup(group)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedGroup(null)
  }

  const handleViewGroup = () => {
    if (selectedGroup) {
      router.push(`/dashboard/admin/grupos/${selectedGroup.id}`)
    }

    handleMenuClose()
  }

  const handleEditGroup = () => {
    // TODO: Implementar edicion
    handleMenuClose()
  }

  const handleRemoveFromNetwork = () => {
    // TODO: Implementar remover de la red
    handleMenuClose()
  }

  if (groups.length === 0) {
    return (
      <Box className='flex flex-col items-center justify-center py-12'>
        <CustomAvatar skin='light' color='primary' size={64} sx={{ mb: 2 }}>
          <i className='ri-team-line text-3xl' />
        </CustomAvatar>
        <Typography variant='h6' className='mbe-1'>
          Sin grupos asignados
        </Typography>
        <Typography variant='body2' color='text.secondary' className='mbe-4'>
          Crea o asigna grupos a esta red
        </Typography>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          onClick={() => router.push('/dashboard/admin/grupos')}
        >
          Crear Grupo
        </Button>
      </Box>
    )
  }

  return (
    <Box className='p-4'>
      {/* Header con accion */}
      <Box className='flex items-center justify-between mbe-4'>
        <Typography variant='subtitle2' color='text.secondary'>
          {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'} en esta red
        </Typography>
        <Button
          size='small'
          variant='outlined'
          startIcon={<i className='ri-add-line' />}
          onClick={() => router.push('/dashboard/admin/grupos')}
        >
          Crear Grupo
        </Button>
      </Box>

      {/* Grid de grupos */}
      <Grid container spacing={3}>
        {groups.map(group => (
          <Grid key={group.id} size={{ xs: 12, sm: 6 }}>
            <GroupCard
              variant='outlined'
              onClick={() => router.push(`/dashboard/admin/grupos/${group.id}`)}
            >
              <CardContent>
                <Box className='flex items-start gap-3'>
                  <Avatar
                    src={group.imageUrl || undefined}
                    variant='rounded'
                    sx={{ width: 48, height: 48, bgcolor: 'success.main' }}
                  >
                    <i className='ri-team-line text-xl' />
                  </Avatar>
                  <Box className='flex-1 min-w-0'>
                    <Box className='flex items-center justify-between'>
                      <Typography variant='subtitle2' fontWeight={600} noWrap>
                        {group.name}
                      </Typography>
                      <IconButton
                        size='small'
                        onClick={(e) => handleMenuOpen(e, group)}
                      >
                        <i className='ri-more-2-line text-sm' />
                      </IconButton>
                    </Box>
                    <Box className='flex gap-1 mbs-1'>
                      <Chip
                        label={group.isActive ? 'Activo' : 'Inactivo'}
                        size='small'
                        color={group.isActive ? 'success' : 'error'}
                        variant='tonal'
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                      {group.modality && (
                        <Chip
                          label={group.modality === 'virtual' ? 'Virtual' : 'Presencial'}
                          size='small'
                          variant='outlined'
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Info del grupo */}
                <Box className='flex flex-wrap gap-3 mbs-3'>
                  {getDayLabel(group.meetingDay) && (
                    <Box className='flex items-center gap-1'>
                      <i className='ri-calendar-line text-textSecondary text-sm' />
                      <Typography variant='caption' color='text.secondary'>
                        {getDayLabel(group.meetingDay)}
                      </Typography>
                    </Box>
                  )}
                  {group.meetingTime && (
                    <Box className='flex items-center gap-1'>
                      <i className='ri-time-line text-textSecondary text-sm' />
                      <Typography variant='caption' color='text.secondary'>
                        {group.meetingTime}
                      </Typography>
                    </Box>
                  )}
                  {group.city && (
                    <Box className='flex items-center gap-1'>
                      <i className='ri-map-pin-line text-textSecondary text-sm' />
                      <Typography variant='caption' color='text.secondary'>
                        {group.city}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Footer */}
                <Box className='flex items-center justify-between mbs-3 pt-3 border-t border-divider'>
                  <Box className='flex items-center gap-2'>
                    <Typography variant='caption' color='text.secondary'>
                      Lideres:
                    </Typography>
                    {group.leaders.length > 0 ? (
                      <Tooltip
                        title={
                          <Box>
                            {group.leaders.map(l => (
                              <div key={l.user.id}>{getDisplayName(l.user)}</div>
                            ))}
                          </Box>
                        }
                      >
                        <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
                          {group.leaders.map(l => (
                            <Avatar
                              key={l.user.id}
                              src={l.user.image || undefined}
                              sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                            >
                              {getDisplayName(l.user).charAt(0)}
                            </Avatar>
                          ))}
                        </AvatarGroup>
                      </Tooltip>
                    ) : (
                      <Typography variant='caption' color='text.secondary'>
                        Sin lider
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    icon={<i className='ri-file-list-3-line text-xs' />}
                    label={`${group._count.reports}`}
                    size='small'
                    variant='tonal'
                    color='primary'
                    sx={{ height: 22 }}
                  />
                </Box>
              </CardContent>
            </GroupCard>
          </Grid>
        ))}
      </Grid>

      {/* Menu de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleViewGroup}>
          <ListItemIcon>
            <i className='ri-eye-line' />
          </ListItemIcon>
          <ListItemText>Ver grupo</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditGroup}>
          <ListItemIcon>
            <i className='ri-edit-line' />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRemoveFromNetwork} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <i className='ri-close-circle-line' />
          </ListItemIcon>
          <ListItemText>Quitar de la red</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default NetworkGroupsTab
