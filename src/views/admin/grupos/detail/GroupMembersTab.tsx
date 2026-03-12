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

import { addUserToGroup, removeUserFromGroup, getAvailableUsersForGroup } from '@/app/server/groupActions'

type NetworkMember = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  image: string | null
  phone: string | null
  networkRole: string | null
  groupRole?: string | null
  groupId?: string | null
  isActive: boolean
}

type Props = {
  members: NetworkMember[]
  groupId: string
  networkName: string
  groupMembers: { id: string; groupRole: string | null }[]
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

const GroupMembersTab = ({ members, groupId, networkName, groupMembers }: Props) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedMember, setSelectedMember] = useState<NetworkMember | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)

  const groupMemberIds = new Set(groupMembers.map(m => m.id))

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

  const handleAddAsLeader = async () => {
    if (!selectedMember) return

    try {
      await addUserToGroup(groupId, selectedMember.id, 'leader')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al agregar')
    }

    handleMenuClose()
  }

  const handleAddAsMember = async () => {
    if (!selectedMember) return

    try {
      await addUserToGroup(groupId, selectedMember.id, 'member')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al agregar')
    }

    handleMenuClose()
  }

  const handleRemoveFromGroup = async () => {
    if (!selectedMember) return

    if (!confirm(`¿Remover a ${getDisplayName(selectedMember)} de este grupo?`)) {
      handleMenuClose()

      return
    }

    try {
      await removeUserFromGroup(selectedMember.id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al remover')
    }

    handleMenuClose()
  }

  const fetchAvailable = useCallback(async () => {
    const users = await getAvailableUsersForGroup(groupId)

    return users.filter(u => !u.groupId)
  }, [groupId])

  const handleAddUserFromPicker = async (userId: string) => {
    await addUserToGroup(groupId, userId, 'member')
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
      <Box className='flex flex-col items-center justify-center py-12'>
        <CustomAvatar skin='light' color='info' size={64} sx={{ mb: 2 }}>
          <i className='ri-group-line text-3xl' />
        </CustomAvatar>
        <Typography variant='h6' className='mbe-1'>
          Sin miembros en la red
        </Typography>
        <Typography variant='body2' color='text.secondary' className='mbe-4 text-center'>
          La red &quot;{networkName}&quot; no tiene miembros asignados
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
        <Box className='flex items-center gap-2'>
          <Chip
            icon={<i className='ri-bubble-chart-line' />}
            label={networkName}
            color='primary'
            variant='outlined'
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
      </Box>

      <Typography variant='caption' color='text.secondary' className='mbe-3 block'>
        Mostrando {filteredMembers.length} de {members.length} miembros de la red
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
            const isInGroup = groupMemberIds.has(member.id)

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
                    {member.networkRole === 'leader' && (
                      <Chip
                        icon={<i className='ri-star-fill' />}
                        label='Lider de red'
                        size='small'
                        color='warning'
                        variant='tonal'
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                    {isInGroup && (
                      <Chip
                        label='En grupo'
                        size='small'
                        color='success'
                        variant='tonal'
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                    {!member.isActive && (
                      <Chip label='Inactivo' size='small' color='error' variant='outlined' sx={{ height: 20 }} />
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
        {selectedMember && !groupMemberIds.has(selectedMember.id) && (
          <>
            <MenuItem onClick={handleAddAsLeader}>
              <ListItemIcon><i className='ri-star-line' /></ListItemIcon>
              <ListItemText>Agregar como lider</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleAddAsMember}>
              <ListItemIcon><i className='ri-user-add-line' /></ListItemIcon>
              <ListItemText>Agregar como miembro</ListItemText>
            </MenuItem>
          </>
        )}
        {selectedMember && groupMemberIds.has(selectedMember.id) && (
          <MenuItem onClick={handleRemoveFromGroup} sx={{ color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}><i className='ri-user-unfollow-line' /></ListItemIcon>
            <ListItemText>Remover del grupo</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <UserPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title='Agregar Miembro al Grupo'
        fetchUsers={fetchAvailable}
        onSelect={handleAddUserFromPicker}
      />
    </Box>
  )
}

export default GroupMembersTab
