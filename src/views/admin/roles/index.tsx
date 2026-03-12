'use client'

import { useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

// Component Imports
import RoleDrawer from './RoleDrawer'

// Server Action Imports
import { deleteRole } from '@/app/server/roleActions'

// Types
import type { RoleListItem, PermissionData } from '@/app/server/roleActions'

type Props = {
  roles: RoleListItem[]
  permissions: PermissionData[]
}

const RolesView = ({ roles: initialRoles, permissions }: Props) => {
  const [roles, setRoles] = useState(initialRoles)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleCreate = () => {
    setEditingRoleId(null)
    setDrawerOpen(true)
  }

  const handleEdit = (roleId: string) => {
    setEditingRoleId(roleId)
    setDrawerOpen(true)
  }

  const handleDelete = async (roleId: string) => {
    if (!confirm('¿Estas seguro de eliminar este rol?')) return

    setDeleting(roleId)

    try {
      await deleteRole(roleId)
      setRoles(prev => prev.filter(r => r.id !== roleId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setDeleting(null)
    }
  }

  const handleSaved = () => {
    // Reload the page to get fresh data
    window.location.reload()
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <Typography variant='h4'>Roles y Permisos</Typography>
        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleCreate}>
          Crear Rol
        </Button>
      </div>

      <Card>
        <CardContent className='p-0'>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rol</TableCell>
                  <TableCell>Jerarquia</TableCell>
                  <TableCell>Permisos</TableCell>
                  <TableCell>Usuarios</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align='right'>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map(role => (
                  <TableRow key={role.id} hover>
                    <TableCell>
                      <div>
                        <Typography className='font-medium'>{role.name}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {role.description || role.slug}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.hierarchy}
                        size='small'
                        color={role.hierarchy <= 2 ? 'primary' : 'default'}
                        variant='tonal'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={role._count.permissions} size='small' variant='outlined' />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role._count.users}
                        size='small'
                        color={role._count.users > 0 ? 'info' : 'default'}
                        variant='tonal'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.isActive ? 'Activo' : 'Inactivo'}
                        size='small'
                        color={role.isActive ? 'success' : 'error'}
                        variant='tonal'
                      />
                    </TableCell>
                    <TableCell align='right'>
                      <IconButton size='small' onClick={() => handleEdit(role.id)}>
                        <i className='ri-edit-line text-textSecondary' />
                      </IconButton>
                      {!role.isSystem && (
                        <IconButton
                          size='small'
                          onClick={() => handleDelete(role.id)}
                          disabled={deleting === role.id}
                        >
                          <i className='ri-delete-bin-line text-textSecondary' />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <RoleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        roleId={editingRoleId}
        permissions={permissions}
        onSaved={handleSaved}
      />
    </div>
  )
}

export default RolesView
