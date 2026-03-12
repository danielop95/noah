'use client'

import { useState, useCallback } from 'react'

import { useRouter } from 'next/navigation'

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

import CustomAvatar from '@core/components/mui/Avatar'
import UserPickerDialog from '@/components/UserPickerDialog'

import {
  addUserToNetwork,
  removeUserFromNetwork,
  changeNetworkRole,
  getAvailableUsersForNetwork
} from '@/app/server/networkActions'

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
  createdAt: Date
}

type Props = {
  members: NetworkUser[]
  networkId: string
}

const getDisplayName = (user: NetworkUser) =>
  user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Sin nombre'

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const NetworkMembersTab = ({ members, networkId }: Props) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedUser, setSelectedUser] = useState<NetworkUser | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: NetworkUser) => {
    setAnchorEl(event.currentTarget)
    setSelectedUser(user)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedUser(null)
  }

  const handleViewProfile = () => {
    if (selectedUser) {
      router.push(`/dashboard/admin/usuarios/${selectedUser.id}`)
    }

    handleMenuClose()
  }

  const handlePromoteToLeader = async () => {
    if (!selectedUser) return

    try {
      await changeNetworkRole(selectedUser.id, 'leader')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al promover')
    }

    handleMenuClose()
  }

  const handleRemoveFromNetwork = async () => {
    if (!selectedUser) return

    if (!confirm(`¿Remover a ${getDisplayName(selectedUser)} de esta red?`)) {
      handleMenuClose()

      return
    }

    try {
      await removeUserFromNetwork(selectedUser.id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al remover')
    }

    handleMenuClose()
  }

  const fetchAvailable = useCallback(
    () => getAvailableUsersForNetwork(networkId),
    [networkId]
  )

  const handleAddUser = async (userId: string) => {
    await addUserToNetwork(networkId, userId, 'member')
    router.refresh()
  }

  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true

    const name = getDisplayName(member).toLowerCase()
    const email = (member.email || '').toLowerCase()
    const query = searchQuery.toLowerCase()

    return name.includes(query) || email.includes(query)
  })

  if (members.length === 0) {
    return (
      <>
        <Box className='flex flex-col items-center justify-center py-12'>
          <CustomAvatar skin='light' color='info' size={64} sx={{ mb: 2 }}>
            <i className='ri-group-line text-3xl' />
          </CustomAvatar>
          <Typography variant='h6' className='mbe-1'>
            Sin miembros asignados
          </Typography>
          <Typography variant='body2' color='text.secondary' className='mbe-4'>
            Agrega miembros a esta red
          </Typography>
          <Button
            variant='contained'
            startIcon={<i className='ri-user-add-line' />}
            onClick={() => setPickerOpen(true)}
          >
            Agregar Miembros
          </Button>
        </Box>
        <UserPickerDialog
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title='Agregar Miembro a la Red'
          fetchUsers={fetchAvailable}
          onSelect={handleAddUser}
        />
      </>
    )
  }

  return (
    <Box className='p-4'>
      <Box className='flex items-center justify-between gap-4 mbe-4 flex-wrap'>
        <TextField
          size='small'
          placeholder='Buscar miembro...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
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
        <Button
          size='small'
          variant='outlined'
          startIcon={<i className='ri-user-add-line' />}
          onClick={() => setPickerOpen(true)}
        >
          Agregar
        </Button>
      </Box>

      <Typography variant='caption' color='text.secondary' className='mbe-3 block'>
        Mostrando {filteredMembers.length} de {members.length} miembros
      </Typography>

      {filteredMembers.length === 0 ? (
        <Box className='text-center py-8'>
          <Typography color='text.secondary'>
            No se encontraron miembros con &quot;{searchQuery}&quot;
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
                <Avatar src={member.image || undefined} sx={{ width: 44, height: 44 }}>
                  {getInitials(displayName)}
                </Avatar>
                <Box className='flex-1 min-w-0'>
                  <Box className='flex items-center gap-2'>
                    <Typography variant='body2' fontWeight={500} noWrap>
                      {displayName}
                    </Typography>
                    {!member.isActive && (
                      <Chip label='Inactivo' size='small' color='error' variant='outlined' sx={{ height: 20 }} />
                    )}
                  </Box>
                  <Typography variant='caption' color='text.secondary' noWrap>
                    {member.email}
                  </Typography>
                </Box>
                <Box className='flex items-center gap-2'>
                  <Typography variant='caption' color='text.disabled' className='hidden sm:block'>
                    {formatDate(member.createdAt)}
                  </Typography>
                  <Tooltip title='Ver perfil'>
                    <IconButton
                      size='small'
                      onClick={() => router.push(`/dashboard/admin/usuarios/${member.id}`)}
                    >
                      <i className='ri-eye-line' />
                    </IconButton>
                  </Tooltip>
                  <IconButton size='small' onClick={e => handleMenuOpen(e, member)}>
                    <i className='ri-more-2-line' />
                  </IconButton>
                </Box>
              </Box>
            )
          })}
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleViewProfile}>
          <ListItemIcon><i className='ri-user-line' /></ListItemIcon>
          <ListItemText>Ver perfil</ListItemText>
        </MenuItem>
        <MenuItem onClick={handlePromoteToLeader}>
          <ListItemIcon><i className='ri-arrow-up-line' /></ListItemIcon>
          <ListItemText>Promover a lider</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleRemoveFromNetwork} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}><i className='ri-user-unfollow-line' /></ListItemIcon>
          <ListItemText>Remover de la red</ListItemText>
        </MenuItem>
      </Menu>

      <UserPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title='Agregar Miembro a la Red'
        fetchUsers={fetchAvailable}
        onSelect={handleAddUser}
      />
    </Box>
  )
}

export default NetworkMembersTab
