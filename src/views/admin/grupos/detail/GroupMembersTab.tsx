'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Tooltip from '@mui/material/Tooltip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

// Custom Components
import CustomAvatar from '@core/components/mui/Avatar'

type NetworkMember = {
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

type Props = {
  members: NetworkMember[]
  groupId: string
  networkName: string
}

const getDisplayName = (user: NetworkMember) =>
  user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Sin nombre'

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

const GroupMembersTab = ({ members, groupId, networkName }: Props) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedMember, setSelectedMember] = useState<NetworkMember | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, member: NetworkMember) => {
    setAnchorEl(event.currentTarget)
    setSelectedMember(member)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedMember(null)
  }

  const handleViewProfile = () => {
    if (selectedMember) {
      router.push(`/dashboard/admin/usuarios/${selectedMember.id}`)
    }

    handleMenuClose()
  }

  const handleAddAsLeader = () => {
    // TODO: Implementar agregar como líder
    console.log('Agregar como líder:', selectedMember?.id)
    handleMenuClose()
  }

  // Filtrar miembros por búsqueda
  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true

    const name = getDisplayName(member).toLowerCase()
    const email = (member.email || '').toLowerCase()
    const query = searchQuery.toLowerCase()

    return name.includes(query) || email.includes(query)
  })

  if (members.length === 0) {
    return (
      <Box className='flex flex-col items-center justify-center py-12'>
        <CustomAvatar skin='light' color='info' size={64} sx={{ mb: 2 }}>
          <i className='ri-group-line text-3xl' />
        </CustomAvatar>
        <Typography variant='h6' className='mbe-1'>
          Sin miembros en la red
        </Typography>
        <Typography variant='body2' color='text.secondary' className='mbe-4 text-center'>
          La red "{networkName}" no tiene miembros asignados
        </Typography>
        <Button
          variant='contained'
          startIcon={<i className='ri-user-add-line' />}
          onClick={() => router.push('/dashboard/admin/redes')}
        >
          Ir a Redes
        </Button>
      </Box>
    )
  }

  return (
    <Box className='p-4'>
      {/* Header con búsqueda */}
      <Box className='flex items-center justify-between gap-4 mbe-4 flex-wrap'>
        <TextField
          size='small'
          placeholder='Buscar miembro...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }
          }}
          sx={{ minWidth: 200 }}
        />
        <Chip
          icon={<i className='ri-bubble-chart-line' />}
          label={networkName}
          color='primary'
          variant='outlined'
        />
      </Box>

      {/* Contador */}
      <Typography variant='caption' color='text.secondary' className='mbe-3 block'>
        Mostrando {filteredMembers.length} de {members.length} miembros de la red
      </Typography>

      {/* Lista de miembros */}
      {filteredMembers.length === 0 ? (
        <Box className='text-center py-8'>
          <Typography color='text.secondary'>
            No se encontraron miembros con "{searchQuery}"
          </Typography>
        </Box>
      ) : (
        <Box className='flex flex-col gap-2'>
          {filteredMembers.map(member => {
            const displayName = getDisplayName(member)

            return (
              <Box
                key={member.id}
                className='flex items-center gap-3 p-3 rounded-lg'
                sx={{
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Avatar
                  src={member.image || undefined}
                  sx={{ width: 44, height: 44 }}
                >
                  {getInitials(displayName)}
                </Avatar>
                <Box className='flex-1 min-w-0'>
                  <Box className='flex items-center gap-2'>
                    <Typography variant='body2' fontWeight={500} noWrap>
                      {displayName}
                    </Typography>
                    {member.networkRole === 'leader' && (
                      <Chip
                        icon={<i className='ri-star-fill' />}
                        label='Líder de red'
                        size='small'
                        color='warning'
                        variant='tonal'
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                    {!member.isActive && (
                      <Chip
                        label='Inactivo'
                        size='small'
                        color='error'
                        variant='outlined'
                        sx={{ height: 20 }}
                      />
                    )}
                  </Box>
                  <Typography variant='caption' color='text.secondary' noWrap>
                    {member.email}
                  </Typography>
                </Box>
                <Box className='flex items-center gap-1'>
                  <Tooltip title='Ver perfil'>
                    <IconButton
                      size='small'
                      onClick={() => router.push(`/dashboard/admin/usuarios/${member.id}`)}
                    >
                      <i className='ri-eye-line' />
                    </IconButton>
                  </Tooltip>
                  <IconButton
                    size='small'
                    onClick={(e) => handleMenuOpen(e, member)}
                  >
                    <i className='ri-more-2-line' />
                  </IconButton>
                </Box>
              </Box>
            )
          })}
        </Box>
      )}

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleViewProfile}>
          <ListItemIcon>
            <i className='ri-user-line' />
          </ListItemIcon>
          <ListItemText>Ver perfil</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAddAsLeader}>
          <ListItemIcon>
            <i className='ri-star-line' />
          </ListItemIcon>
          <ListItemText>Agregar como líder</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default GroupMembersTab
