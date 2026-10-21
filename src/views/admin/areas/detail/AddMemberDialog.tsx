'use client'

import { useState } from 'react'

import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { addAreaMember } from '@/app/server/areasActions'

export type AvailableUser = {
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
  areaId: string
  availableUsers: AvailableUser[]
  onSuccess: () => void
}

const getDisplayName = (u: AvailableUser) =>
  u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Sin nombre'

const AddMemberDialog = ({ open, onClose, areaId, availableUsers, onSuccess }: Props) => {
  const [selectedUser, setSelectedUser] = useState<AvailableUser | null>(null)
  const [role, setRole] = useState<'LIDER' | 'MIEMBRO'>('MIEMBRO')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!selectedUser) {
      setError('Selecciona un usuario')

      return
    }

    setSaving(true)
    setError(null)

    try {
      await addAreaMember(areaId, selectedUser.id, role)
      setSelectedUser(null)
      setRole('MIEMBRO')
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al añadir')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth PaperProps={{ sx: { borderRadius: '16px' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Añadir Miembro al Área
        <IconButton onClick={onClose}>
          <i className='solar-close-square-linear' />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box className='flex flex-col gap-4'>
          {error && <Alert severity='error'>{error}</Alert>}

          <Autocomplete
            options={availableUsers}
            getOptionLabel={u => getDisplayName(u)}
            value={selectedUser}
            onChange={(_, v) => setSelectedUser(v)}
            renderOption={(props, u) => (
              <li {...props} key={u.id}>
                <div className='flex items-center gap-2'>
                  <Avatar src={u.image || undefined} sx={{ width: 28, height: 28 }}>
                    {getDisplayName(u).charAt(0)}
                  </Avatar>
                  <div>
                    <Typography variant='body2'>{getDisplayName(u)}</Typography>
                    {u.email && (
                      <Typography variant='caption' color='text.secondary'>
                        {u.email}
                      </Typography>
                    )}
                  </div>
                </div>
              </li>
            )}
            renderInput={params => <TextField {...params} label='Usuario' placeholder='Buscar...' />}
          />

          <TextField
            select
            label='Rol en el área'
            value={role}
            onChange={e => setRole(e.target.value as 'LIDER' | 'MIEMBRO')}
            fullWidth
          >
            <MenuItem value='MIEMBRO'>Miembro</MenuItem>
            <MenuItem value='LIDER'>Líder (aprobará solicitudes dirigidas a esta área)</MenuItem>
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant='outlined' onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant='contained' onClick={handleSubmit} disabled={saving || !selectedUser} fullWidth>
          {saving ? 'Añadiendo...' : 'Añadir'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddMemberDialog
