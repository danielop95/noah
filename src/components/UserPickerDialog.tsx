'use client'

import { useState, useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'

type PickerUser = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  image: string | null
  email: string | null
}

type Props = {
  open: boolean
  onClose: () => void
  title: string
  fetchUsers: () => Promise<PickerUser[]>
  onSelect: (userId: string) => Promise<void>
  excludeIds?: string[]
}

const getDisplayName = (user: PickerUser) =>
  user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Sin nombre'

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

const UserPickerDialog = ({ open, onClose, title, fetchUsers, onSelect, excludeIds = [] }: Props) => {
  const [users, setUsers] = useState<PickerUser[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSearch('')
      setError(null)
      return
    }

    setLoading(true)
    fetchUsers()
      .then(setUsers)
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false))
  }, [open, fetchUsers])

  const handleSelect = async (userId: string) => {
    setAdding(userId)
    setError(null)

    try {
      await onSelect(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar')
    } finally {
      setAdding(null)
    }
  }

  const excludeSet = new Set(excludeIds)

  const filtered = users.filter(u => {
    if (excludeSet.has(u.id)) return false
    if (!search) return true

    const name = getDisplayName(u).toLowerCase()
    const email = (u.email || '').toLowerCase()
    const query = search.toLowerCase()

    return name.includes(query) || email.includes(query)
  })

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle className='flex items-center justify-between'>
        <span>{title}</span>
        <IconButton size='small' onClick={onClose}>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size='small'
          placeholder='Buscar por nombre o email...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }
          }}
          sx={{ mb: 2 }}
        />

        {error && (
          <Typography variant='body2' color='error' sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Box className='flex justify-center py-8'>
            <CircularProgress size={32} />
          </Box>
        ) : filtered.length === 0 ? (
          <Box className='text-center py-8'>
            <Typography color='text.secondary'>
              {search ? `No se encontraron usuarios con "${search}"` : 'No hay usuarios disponibles'}
            </Typography>
          </Box>
        ) : (
          <Box className='flex flex-col gap-1' sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {filtered.map(user => {
              const displayName = getDisplayName(user)
              const isAdding = adding === user.id

              return (
                <Box
                  key={user.id}
                  className='flex items-center gap-3 p-2 rounded-lg cursor-pointer'
                  sx={{
                    '&:hover': { bgcolor: 'action.hover' },
                    opacity: isAdding ? 0.5 : 1,
                    pointerEvents: isAdding ? 'none' : 'auto'
                  }}
                  onClick={() => handleSelect(user.id)}
                >
                  <Avatar src={user.image || undefined} sx={{ width: 36, height: 36 }}>
                    {getInitials(displayName)}
                  </Avatar>
                  <Box className='flex-1 min-w-0'>
                    <Typography variant='body2' fontWeight={500} noWrap>
                      {displayName}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' noWrap>
                      {user.email}
                    </Typography>
                  </Box>
                  {isAdding ? (
                    <CircularProgress size={20} />
                  ) : (
                    <i className='ri-add-line text-xl text-textSecondary' />
                  )}
                </Box>
              )
            })}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default UserPickerDialog
