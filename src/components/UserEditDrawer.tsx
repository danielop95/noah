'use client'

import { useState, useEffect } from 'react'

import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

import { updateUserByAdmin } from '@/app/server/adminActions'
import { getRolesForAssignment } from '@/app/server/roleActions'
import { getNetworksForSelect } from '@/app/server/networkActions'
import { addUserToNetwork, removeUserFromNetwork } from '@/app/server/networkActions'
import { getGroupsForSelect, addUserToGroup, removeUserFromGroup } from '@/app/server/groupActions'

type EditableUser = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  image: string | null
  phone: string | null
  city: string | null
  country?: string | null
  roleId: string | null
  isActive: boolean
  networkId: string | null
  networkRole: string | null
  network: { id: string; name: string } | null
  groupId: string | null
  groupRole: string | null
  group: { id: string; name: string } | null
}

type Props = {
  open: boolean
  onClose: () => void
  user: EditableUser | null
  onSaved: () => void
}

type NetworkOption = { id: string; name: string }
type GroupOption = { id: string; name: string; networkId: string }

const UserEditDrawer = ({ open, onClose, user, onSaved }: Props) => {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Roles
  const [availableRoles, setAvailableRoles] = useState<Array<{ id: string; name: string; slug: string; hierarchy: number }>>([])

  // Form fields
  const [editRoleId, setEditRoleId] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editCountry, setEditCountry] = useState('')

  // Network & Group assignment
  const [networks, setNetworks] = useState<NetworkOption[]>([])
  const [groups, setGroups] = useState<GroupOption[]>([])
  const [editNetworkId, setEditNetworkId] = useState('')
  const [editNetworkRole, setEditNetworkRole] = useState<'leader' | 'member'>('member')
  const [editGroupId, setEditGroupId] = useState('')
  const [editGroupRole, setEditGroupRole] = useState<'leader' | 'member'>('member')

  // Load roles and networks when drawer opens
  useEffect(() => {
    if (!open || !user) return

    setEditRoleId(user.roleId || '')
    setEditActive(user.isActive)
    setEditFirstName(user.firstName || '')
    setEditLastName(user.lastName || '')
    setEditPhone(user.phone || '')
    setEditCity(user.city || '')
    setEditCountry(user.country || '')
    setEditNetworkId(user.networkId || '')
    setEditNetworkRole((user.networkRole as 'leader' | 'member') || 'member')
    setEditGroupId(user.groupId || '')
    setEditGroupRole((user.groupRole as 'leader' | 'member') || 'member')
    setError(null)

    getRolesForAssignment().then(setAvailableRoles).catch(() => {})
    getNetworksForSelect().then(setNetworks).catch(() => {})

    if (user.networkId) {
      getGroupsForSelect(user.networkId).then(setGroups).catch(() => {})
    }
  }, [open, user])

  // Load groups when network changes
  useEffect(() => {
    if (!editNetworkId) {
      setGroups([])
      setEditGroupId('')

      return
    }

    getGroupsForSelect(editNetworkId).then(setGroups).catch(() => {})
  }, [editNetworkId])

  const handleNetworkChange = (newNetworkId: string) => {
    setEditNetworkId(newNetworkId)
    setEditNetworkRole('member')

    // Reset group if network changed
    if (newNetworkId !== user?.networkId) {
      setEditGroupId('')
      setEditGroupRole('member')
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setError(null)

    try {
      // 1. Update basic user info
      await updateUserByAdmin(user.id, {
        roleId: editRoleId || undefined,
        isActive: editActive,
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
        city: editCity,
        country: editCountry
      })

      // 2. Handle network assignment changes
      const networkChanged = editNetworkId !== (user.networkId || '')

      if (networkChanged) {
        // Remove from current network first (also removes from group)
        if (user.networkId) {
          await removeUserFromNetwork(user.id)
        }

        // Add to new network
        if (editNetworkId) {
          await addUserToNetwork(editNetworkId, user.id, editNetworkRole)
        }
      } else if (editNetworkId && editNetworkRole !== user.networkRole) {
        // Same network, but role changed
        const { changeNetworkRole } = await import('@/app/server/networkActions')

        await changeNetworkRole(user.id, editNetworkRole)
      }

      // 3. Handle group assignment changes
      const groupChanged = editGroupId !== (user.groupId || '')

      if (groupChanged || (networkChanged && editGroupId)) {
        // Remove from current group first (if not already removed by network change)
        if (user.groupId && !networkChanged) {
          await removeUserFromGroup(user.id)
        }

        // Add to new group
        if (editGroupId) {
          await addUserToGroup(editGroupId, user.id, editGroupRole)
        }
      } else if (editGroupId && editGroupRole !== user.groupRole) {
        // Same group, but role changed — re-add with new role
        await removeUserFromGroup(user.id)
        await addUserToGroup(editGroupId, user.id, editGroupRole)
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre'

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 450 } } }}
    >
      <div className='flex flex-col gap-5 p-6 overflow-y-auto'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <Typography variant='h6'>Editar Usuario</Typography>
          <IconButton onClick={onClose}>
            <i className='ri-close-line' />
          </IconButton>
        </div>

        {error && <Alert severity='error'>{error}</Alert>}

        {/* User preview */}
        <div className='flex items-center gap-3'>
          <Avatar src={user.image || undefined} alt={displayName} />
          <div>
            <Typography className='font-medium'>{displayName}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {user.email}
            </Typography>
          </div>
        </div>

        {/* Rol y Estado */}
        <div>
          <Typography variant='subtitle2' className='mbe-3'>Rol y Estado</Typography>
          <div className='flex flex-col gap-4'>
            <FormControl fullWidth size='small'>
              <InputLabel>Rol</InputLabel>
              <Select value={editRoleId} label='Rol' onChange={e => setEditRoleId(e.target.value)}>
                {availableRoles.map(r => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size='small'>
              <InputLabel>Estado</InputLabel>
              <Select
                value={editActive ? 'active' : 'inactive'}
                label='Estado'
                onChange={e => setEditActive(e.target.value === 'active')}
              >
                <MenuItem value='active'>Activo</MenuItem>
                <MenuItem value='inactive'>Inactivo</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <Divider />

        {/* Informacion Personal */}
        <div>
          <Typography variant='subtitle2' className='mbe-3'>Informacion Personal</Typography>
          <div className='flex flex-col gap-4'>
            <TextField
              fullWidth
              size='small'
              label='Nombre'
              value={editFirstName}
              onChange={e => setEditFirstName(e.target.value)}
            />
            <TextField
              fullWidth
              size='small'
              label='Apellido'
              value={editLastName}
              onChange={e => setEditLastName(e.target.value)}
            />
            <TextField
              fullWidth
              size='small'
              label='Telefono'
              value={editPhone}
              onChange={e => setEditPhone(e.target.value)}
            />
          </div>
        </div>

        <Divider />

        {/* Ubicacion */}
        <div>
          <Typography variant='subtitle2' className='mbe-3'>Ubicacion</Typography>
          <div className='flex flex-col gap-4'>
            <TextField
              fullWidth
              size='small'
              label='Ciudad'
              value={editCity}
              onChange={e => setEditCity(e.target.value)}
            />
            <TextField
              fullWidth
              size='small'
              select
              label='Pais'
              value={editCountry}
              onChange={e => setEditCountry(e.target.value)}
            >
              <MenuItem value=''>Seleccionar</MenuItem>
              <MenuItem value='CO'>Colombia</MenuItem>
              <MenuItem value='VE'>Venezuela</MenuItem>
              <MenuItem value='EC'>Ecuador</MenuItem>
              <MenuItem value='PE'>Peru</MenuItem>
              <MenuItem value='MX'>Mexico</MenuItem>
              <MenuItem value='AR'>Argentina</MenuItem>
            </TextField>
          </div>
        </div>

        <Divider />

        {/* Asignacion a Red */}
        <div>
          <Typography variant='subtitle2' className='mbe-3'>Asignacion a Red</Typography>
          <div className='flex flex-col gap-4'>
            <FormControl fullWidth size='small'>
              <InputLabel>Red</InputLabel>
              <Select
                value={editNetworkId}
                label='Red'
                onChange={e => handleNetworkChange(e.target.value)}
              >
                <MenuItem value=''>Sin red</MenuItem>
                {networks.map(n => (
                  <MenuItem key={n.id} value={n.id}>{n.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {editNetworkId && (
              <FormControl fullWidth size='small'>
                <InputLabel>Rol en Red</InputLabel>
                <Select
                  value={editNetworkRole}
                  label='Rol en Red'
                  onChange={e => setEditNetworkRole(e.target.value as 'leader' | 'member')}
                >
                  <MenuItem value='member'>Miembro</MenuItem>
                  <MenuItem value='leader'>Lider</MenuItem>
                </Select>
              </FormControl>
            )}
          </div>
        </div>

        {/* Asignacion a Grupo (solo si tiene red) */}
        {editNetworkId && (
          <>
            <Divider />
            <div>
              <Typography variant='subtitle2' className='mbe-3'>Asignacion a Grupo</Typography>
              {groups.length === 0 ? (
                <Typography variant='body2' color='text.secondary'>
                  No hay grupos en esta red
                </Typography>
              ) : (
                <div className='flex flex-col gap-4'>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Grupo</InputLabel>
                    <Select
                      value={editGroupId}
                      label='Grupo'
                      onChange={e => setEditGroupId(e.target.value)}
                    >
                      <MenuItem value=''>Sin grupo</MenuItem>
                      {groups.map(g => (
                        <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {editGroupId && (
                    <FormControl fullWidth size='small'>
                      <InputLabel>Rol en Grupo</InputLabel>
                      <Select
                        value={editGroupRole}
                        label='Rol en Grupo'
                        onChange={e => setEditGroupRole(e.target.value as 'leader' | 'member')}
                      >
                        <MenuItem value='member'>Miembro</MenuItem>
                        <MenuItem value='leader'>Lider</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        <div className='flex gap-4 mbs-2'>
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={saving}
            fullWidth
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          <Button
            variant='outlined'
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Drawer>
  )
}

export default UserEditDrawer
