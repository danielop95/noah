'use client'

import { useState, useEffect, useMemo } from 'react'

// MUI Imports
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Switch from '@mui/material/Switch'

// Server Action Imports
import { getRoleById, createRole, updateRole } from '@/app/server/roleActions'

// Types
import type { PermissionData } from '@/app/server/roleActions'

type Props = {
  open: boolean
  onClose: () => void
  roleId: string | null
  permissions: PermissionData[]
  onSaved: () => void
}

const RoleDrawer = ({ open, onClose, roleId, permissions, onSaved }: Props) => {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [hierarchy, setHierarchy] = useState(5)
  const [isActive, setIsActive] = useState(true)
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    const grouped = new Map<string, PermissionData[]>()

    for (const perm of permissions) {
      const existing = grouped.get(perm.module) || []

      existing.push(perm)
      grouped.set(perm.module, existing)
    }

    return grouped
  }, [permissions])

  // All unique actions across modules
  const allActions = useMemo(() => {
    const actions = new Set<string>()

    for (const perm of permissions) {
      actions.add(perm.action)
    }

    return Array.from(actions).sort()
  }, [permissions])

  // Module display names
  const moduleLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    usuarios: 'Usuarios',
    redes: 'Redes',
    grupos: 'Grupos',
    reportes: 'Reportes',
    calendario: 'Calendario',
    configuracion: 'Configuracion',
    roles: 'Roles'
  }

  // Load role data when editing
  useEffect(() => {
    if (!open) return

    if (roleId) {
      setLoading(true)
      getRoleById(roleId)
        .then(role => {
          if (role) {
            setName(role.name)
            setSlug(role.slug)
            setDescription(role.description || '')
            setHierarchy(role.hierarchy)
            setIsActive(role.isActive)
            setSelectedPermissions(new Set(role.permissions.map(rp => rp.permission.id)))
          }
        })
        .catch(() => setError('Error al cargar el rol'))
        .finally(() => setLoading(false))
    } else {
      // Reset for create
      setName('')
      setSlug('')
      setDescription('')
      setHierarchy(5)
      setIsActive(true)
      setSelectedPermissions(new Set())
    }

    setError(null)
  }, [open, roleId])

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value)

    if (!roleId) {
      setSlug(
        value
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      )
    }
  }

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => {
      const next = new Set(prev)

      if (next.has(permId)) {
        next.delete(permId)
      } else {
        next.add(permId)
      }

      return next
    })
  }

  const toggleModule = (module: string) => {
    const modulePerms = permissionsByModule.get(module) || []
    const allSelected = modulePerms.every(p => selectedPermissions.has(p.id))

    setSelectedPermissions(prev => {
      const next = new Set(prev)

      for (const perm of modulePerms) {
        if (allSelected) {
          next.delete(perm.id)
        } else {
          next.add(perm.id)
        }
      }

      return next
    })
  }

  const handleSave = async () => {
    if (!name.trim() || !slug.trim()) {
      setError('Nombre y slug son requeridos')

      return
    }

    setSaving(true)
    setError(null)

    try {
      if (roleId) {
        await updateRole(roleId, {
          name,
          description,
          hierarchy,
          isActive,
          permissionIds: Array.from(selectedPermissions)
        })
      } else {
        await createRole({
          name,
          slug,
          description,
          hierarchy,
          permissionIds: Array.from(selectedPermissions)
        })
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const getPermissionForCell = (module: string, action: string): PermissionData | undefined => {
    return (permissionsByModule.get(module) || []).find(p => p.action === action)
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 600, md: 700 } } }}
    >
      <div className='flex flex-col gap-5 p-6 h-full overflow-y-auto'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <Typography variant='h6'>{roleId ? 'Editar Rol' : 'Crear Rol'}</Typography>
          <IconButton onClick={onClose}>
            <i className='ri-close-line' />
          </IconButton>
        </div>

        {error && <Alert severity='error'>{error}</Alert>}

        {loading ? (
          <div className='flex justify-center py-8'>
            <Typography color='text.secondary'>Cargando...</Typography>
          </div>
        ) : (
          <>
            {/* Basic Info */}
            <div className='flex flex-col gap-4'>
              <TextField
                fullWidth
                label='Nombre del Rol'
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder='Ej: Coordinador'
              />
              <div className='flex gap-4'>
                <TextField
                  fullWidth
                  label='Slug (identificador)'
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  disabled={!!roleId}
                  placeholder='coordinador'
                />
                <TextField
                  label='Jerarquia'
                  type='number'
                  value={hierarchy}
                  onChange={e => setHierarchy(Number(e.target.value))}
                  slotProps={{ htmlInput: { min: 1, max: 99 } }}
                  sx={{ minWidth: 120 }}
                />
              </div>
              <TextField
                fullWidth
                label='Descripcion'
                value={description}
                onChange={e => setDescription(e.target.value)}
                multiline
                rows={2}
              />
              {roleId && (
                <FormControlLabel
                  control={<Switch checked={isActive} onChange={e => setIsActive(e.target.checked)} />}
                  label='Rol Activo'
                />
              )}
            </div>

            <Divider />

            {/* Permission Matrix */}
            <div>
              <Typography variant='subtitle1' className='font-semibold mbe-3'>
                Permisos
              </Typography>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, minWidth: 140 }}>Modulo</TableCell>
                      {allActions.map(action => (
                        <TableCell key={action} align='center' sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                          {action}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.from(permissionsByModule.keys()).map(module => {
                      const modulePerms = permissionsByModule.get(module) || []
                      const allChecked = modulePerms.every(p => selectedPermissions.has(p.id))
                      const someChecked = modulePerms.some(p => selectedPermissions.has(p.id))

                      return (
                        <TableRow key={module} hover>
                          <TableCell>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  size='small'
                                  checked={allChecked}
                                  indeterminate={someChecked && !allChecked}
                                  onChange={() => toggleModule(module)}
                                />
                              }
                              label={
                                <Typography variant='body2' className='font-medium'>
                                  {moduleLabels[module] || module}
                                </Typography>
                              }
                            />
                          </TableCell>
                          {allActions.map(action => {
                            const perm = getPermissionForCell(module, action)

                            return (
                              <TableCell key={action} align='center'>
                                {perm ? (
                                  <Checkbox
                                    size='small'
                                    checked={selectedPermissions.has(perm.id)}
                                    onChange={() => togglePermission(perm.id)}
                                  />
                                ) : (
                                  <Typography variant='caption' color='text.disabled'>
                                    —
                                  </Typography>
                                )}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography variant='caption' color='text.secondary' className='mbs-2 block'>
                {selectedPermissions.size} permisos seleccionados
              </Typography>
            </div>

            {/* Actions */}
            <div className='flex gap-4 mbs-auto'>
              <Button variant='contained' onClick={handleSave} disabled={saving} fullWidth>
                {saving ? 'Guardando...' : roleId ? 'Guardar Cambios' : 'Crear Rol'}
              </Button>
              <Button variant='outlined' onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
            </div>
          </>
        )}
      </div>
    </Drawer>
  )
}

export default RoleDrawer
