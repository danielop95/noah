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

import CustomAvatar from '@core/components/mui/Avatar'
import UserPickerDialog from '@/components/UserPickerDialog'

import { addUserToGroup, removeUserFromGroup, getAvailableUsersForGroup } from '@/app/server/groupActions'

type LeaderUser = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  image: string | null
  phone: string | null
  isActive: boolean
}

type Props = {
  leaders: LeaderUser[]
  groupId: string
  networkId: string
}

const getDisplayName = (user: LeaderUser) =>
  user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Sin nombre'

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

const GroupLeadersTab = ({ leaders, groupId, networkId }: Props) => {
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedLeader, setSelectedLeader] = useState<LeaderUser | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, leader: LeaderUser) => {
    setAnchorEl(event.currentTarget)
    setSelectedLeader(leader)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedLeader(null)
  }

  const handleViewProfile = () => {
    if (selectedLeader) {
      router.push(`/dashboard/admin/usuarios/${selectedLeader.id}`)
    }

    handleMenuClose()
  }

  const handleRemoveLeader = async () => {
    if (!selectedLeader) return

    if (!confirm(`¿Remover a ${getDisplayName(selectedLeader)} de este grupo?`)) {
      handleMenuClose()

      return
    }

    try {
      await removeUserFromGroup(selectedLeader.id)
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al remover')
    }

    handleMenuClose()
  }

  const fetchAvailable = useCallback(async () => {
    const users = await getAvailableUsersForGroup(groupId)

    // Exclude users already leaders of this group
    const leaderIds = new Set(leaders.map(l => l.id))

    return users.filter(u => !leaderIds.has(u.id))
  }, [groupId, leaders])

  const handleAddLeader = async (userId: string) => {
    await addUserToGroup(groupId, userId, 'leader')
    router.refresh()
  }

  if (leaders.length === 0) {
    return (
      <>
        <Box className='flex flex-col items-center justify-center py-12'>
          <CustomAvatar skin='light' color='warning' size={64} sx={{ mb: 2 }}>
            <i className='ri-star-line text-3xl' />
          </CustomAvatar>
          <Typography variant='h6' className='mbe-1'>
            Sin lideres asignados
          </Typography>
          <Typography variant='body2' color='text.secondary' className='mbe-4'>
            Este grupo necesita al menos un lider
          </Typography>
          <Button
            variant='contained'
            startIcon={<i className='ri-user-add-line' />}
            onClick={() => setPickerOpen(true)}
          >
            Agregar Lider
          </Button>
        </Box>
        <UserPickerDialog
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title='Agregar Lider al Grupo'
          fetchUsers={fetchAvailable}
          onSelect={handleAddLeader}
        />
      </>
    )
  }

  return (
    <Box className='p-4'>
      <Box className='flex items-center justify-between mbe-4'>
        <Typography variant='subtitle2' color='text.secondary'>
          {leaders.length} {leaders.length === 1 ? 'lider' : 'lideres'} en este grupo
        </Typography>
        <Button
          size='small'
          variant='outlined'
          startIcon={<i className='ri-user-add-line' />}
          onClick={() => setPickerOpen(true)}
        >
          Agregar
        </Button>
      </Box>

      <Box className='flex flex-col gap-3'>
        {leaders.map(leader => {
          const displayName = getDisplayName(leader)

          return (
            <Box
              key={leader.id}
              className='flex items-center gap-3 p-3 rounded-lg'
              sx={{ bgcolor: 'action.hover' }}
            >
              <Avatar src={leader.image || undefined} sx={{ width: 48, height: 48 }}>
                {getInitials(displayName)}
              </Avatar>
              <Box className='flex-1 min-w-0'>
                <Box className='flex items-center gap-2'>
                  <Typography variant='body1' fontWeight={500} noWrap>
                    {displayName}
                  </Typography>
                  <Chip
                    icon={<i className='ri-star-fill' />}
                    label='Lider'
                    size='small'
                    color='warning'
                    variant='tonal'
                    sx={{ height: 22 }}
                  />
                  {!leader.isActive && (
                    <Chip label='Inactivo' size='small' color='error' variant='outlined' sx={{ height: 22 }} />
                  )}
                </Box>
                <Typography variant='body2' color='text.secondary' noWrap>
                  {leader.email}
                </Typography>
                {leader.phone && (
                  <Typography variant='caption' color='text.secondary'>
                    {leader.phone}
                  </Typography>
                )}
              </Box>
              <Box className='flex items-center gap-1'>
                <Tooltip title='Ver perfil'>
                  <IconButton
                    size='small'
                    onClick={() => router.push(`/dashboard/admin/usuarios/${leader.id}`)}
                  >
                    <i className='ri-eye-line' />
                  </IconButton>
                </Tooltip>
                <IconButton size='small' onClick={e => handleMenuOpen(e, leader)}>
                  <i className='ri-more-2-line' />
                </IconButton>
              </Box>
            </Box>
          )
        })}
      </Box>

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
        <MenuItem onClick={handleRemoveLeader} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}><i className='ri-user-unfollow-line' /></ListItemIcon>
          <ListItemText>Remover del grupo</ListItemText>
        </MenuItem>
      </Menu>

      <UserPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title='Agregar Lider al Grupo'
        fetchUsers={fetchAvailable}
        onSelect={handleAddLeader}
      />
    </Box>
  )
}

export default GroupLeadersTab
