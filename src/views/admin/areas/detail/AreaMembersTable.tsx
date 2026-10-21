'use client'

import { useState } from 'react'

import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { removeAreaMember, updateAreaMemberRole } from '@/app/server/areasActions'

type Membership = {
  id: string
  areaId: string
  userId: string
  role: 'LIDER' | 'MIEMBRO'
  user: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    phone: string | null
    image: string | null
    isActive: boolean
  }
}

type Props = {
  areaId: string
  memberships: Membership[]
  onChange: () => void
}

const getDisplayName = (u: Membership['user']) =>
  u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Sin nombre'

const AreaMembersTable = ({ areaId, memberships, onChange }: Props) => {
  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null)
  const [removeDialog, setRemoveDialog] = useState<Membership | null>(null)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRoleChange = async (membership: Membership, newRole: 'LIDER' | 'MIEMBRO') => {
    if (newRole === membership.role) return
    setPendingRoleId(membership.id)
    setError(null)

    try {
      await updateAreaMemberRole(areaId, membership.userId, newRole)
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar el rol')
    } finally {
      setPendingRoleId(null)
    }
  }

  const handleRemove = async () => {
    if (!removeDialog) return
    setRemoving(true)
    setError(null)

    try {
      await removeAreaMember(areaId, removeDialog.userId)
      setRemoveDialog(null)
      onChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al remover')
    } finally {
      setRemoving(false)
    }
  }

  if (memberships.length === 0) {
    return (
      <div className='text-center plb-8 text-textSecondary'>
        <Typography variant='body2'>
          Esta área aún no tiene miembros. Usa el botón "Añadir Miembro" para empezar.
        </Typography>
      </div>
    )
  }

  return (
    <>
      {error && (
        <Typography variant='body2' color='error' className='mb-3'>
          {error}
        </Typography>
      )}
      <div className='overflow-x-auto'>
        <table className='is-full' style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr className='border-be bg-backgroundDefault'>
              <th className='plb-3 pli-4 text-start font-medium text-textSecondary'>Usuario</th>
              <th className='plb-3 pli-4 text-start font-medium text-textSecondary'>Contacto</th>
              <th className='plb-3 pli-4 text-start font-medium text-textSecondary'>Rol</th>
              <th className='plb-3 pli-4 text-start font-medium text-textSecondary'>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {memberships.map(m => (
              <tr key={m.id} className='border-be hover:bg-actionHover'>
                <td className='plb-3 pli-4'>
                  <div className='flex items-center gap-3'>
                    <Avatar src={m.user.image || undefined} sx={{ width: 36, height: 36 }}>
                      {getDisplayName(m.user).charAt(0)}
                    </Avatar>
                    <div>
                      <Typography variant='body2' className='font-medium'>
                        {getDisplayName(m.user)}
                      </Typography>
                      {!m.user.isActive && (
                        <Chip label='Inactivo' size='small' color='error' variant='tonal' />
                      )}
                    </div>
                  </div>
                </td>
                <td className='plb-3 pli-4'>
                  <Typography variant='body2'>{m.user.email || '-'}</Typography>
                  {m.user.phone && (
                    <Typography variant='caption' color='text.secondary'>
                      {m.user.phone}
                    </Typography>
                  )}
                </td>
                <td className='plb-3 pli-4'>
                  <Select
                    size='small'
                    value={m.role}
                    disabled={pendingRoleId === m.id}
                    onChange={e => handleRoleChange(m, e.target.value as 'LIDER' | 'MIEMBRO')}
                  >
                    <MenuItem value='LIDER'>Líder</MenuItem>
                    <MenuItem value='MIEMBRO'>Miembro</MenuItem>
                  </Select>
                </td>
                <td className='plb-3 pli-4'>
                  <Tooltip title='Quitar de esta área'>
                    <IconButton size='small' onClick={() => setRemoveDialog(m)}>
                      <i className='solar-trash-bin-trash-linear text-error' />
                    </IconButton>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!removeDialog} onClose={() => setRemoveDialog(null)}>
        <DialogTitle>Quitar miembro</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Quitar a <strong>{removeDialog ? getDisplayName(removeDialog.user) : ''}</strong> de esta área?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialog(null)} disabled={removing}>
            Cancelar
          </Button>
          <Button onClick={handleRemove} color='error' variant='contained' disabled={removing}>
            {removing ? 'Quitando...' : 'Quitar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AreaMembersTable
