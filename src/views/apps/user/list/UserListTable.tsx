'use client'

// React Imports
import { useMemo, useState } from 'react'

// Next Imports
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import Alert from '@mui/material/Alert'

// Third-party Imports
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table'
import type { FilterFn } from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'

// Type Imports
import type { Locale } from '@configs/i18n'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Server Action Imports
import { updateUserByAdmin, deactivateUser } from '@/app/server/adminActions'

type UserRow = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  city: string | null
  isActive: boolean
  createdAt: Date
  networkId: string | null
  networkRole: string | null
  network: { id: string; name: string } | null
  groupLeaderships: Array<{ group: { id: string; name: string } }>
}

const fuzzyFilter: FilterFn<UserRow> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<UserRow>()

const UserListTable = ({ users: initialUsers }: { users: UserRow[] }) => {
  const [users, setUsers] = useState(initialUsers)
  const [globalFilter, setGlobalFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [editRole, setEditRole] = useState('')
  const [editActive, setEditActive] = useState(true)
  const [editError, setEditError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const router = useRouter()
  const { lang: locale } = useParams()

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (roleFilter && user.role !== roleFilter) return false
      if (statusFilter === 'active' && !user.isActive) return false
      if (statusFilter === 'inactive' && user.isActive) return false

      return true
    })
  }, [users, roleFilter, statusFilter])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Nombre',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar src={row.original.image || ''} alt={row.original.name || ''} sx={{ width: 34, height: 34 }} />
            <div>
              <Typography className='font-medium' color='text.primary'>
                {row.original.name || `${row.original.firstName || ''} ${row.original.lastName || ''}`.trim() || 'Sin nombre'}
              </Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: ({ getValue }) => (
          <Typography variant='body2'>{getValue() || '-'}</Typography>
        )
      }),
      columnHelper.accessor('phone', {
        header: 'Teléfono',
        cell: ({ getValue }) => (
          <Typography variant='body2'>{getValue() || '-'}</Typography>
        )
      }),
      columnHelper.accessor('role', {
        header: 'Rol',
        cell: ({ getValue }) => {
          const role = getValue() || 'user'

          return (
            <Chip
              label={role === 'admin' ? 'Admin' : 'Usuario'}
              color={role === 'admin' ? 'primary' : 'default'}
              size='small'
              variant='tonal'
            />
          )
        }
      }),
      columnHelper.accessor('network', {
        header: 'Red',
        cell: ({ row }) => {
          const network = row.original.network
          const networkRole = row.original.networkRole

          if (!network) {
            return <Typography variant='body2' className='text-textSecondary'>-</Typography>
          }

          return (
            <Chip
              label={network.name}
              size='small'
              variant='tonal'
              color={networkRole === 'leader' ? 'warning' : 'info'}
              icon={networkRole === 'leader' ? <i className='ri-star-line text-xs' /> : undefined}
            />
          )
        }
      }),
      columnHelper.display({
        id: 'groups',
        header: 'Grupos',
        cell: ({ row }) => {
          const groups = row.original.groupLeaderships || []

          if (groups.length === 0) {
            return <Typography variant='body2' className='text-textSecondary'>-</Typography>
          }

          return (
            <div className='flex flex-wrap gap-1'>
              {groups.slice(0, 2).map(({ group }) => (
                <Chip
                  key={group.id}
                  label={group.name}
                  size='small'
                  variant='outlined'
                  icon={<i className='ri-team-line text-xs' />}
                />
              ))}
              {groups.length > 2 && (
                <Chip
                  label={`+${groups.length - 2}`}
                  size='small'
                  variant='tonal'
                />
              )}
            </div>
          )
        }
      }),
      columnHelper.accessor('isActive', {
        header: 'Estado',
        cell: ({ getValue }) => (
          <Chip
            label={getValue() ? 'Activo' : 'Inactivo'}
            color={getValue() ? 'success' : 'error'}
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.accessor('city', {
        header: 'Ciudad',
        cell: ({ getValue }) => (
          <Typography variant='body2'>{getValue() || '-'}</Typography>
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <IconButton
              size='small'
              onClick={() => router.push(`/dashboard/admin/usuarios/${row.original.id}`)}
            >
              <i className='ri-eye-line text-textSecondary' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => {
                setSelectedUser(row.original)
                setEditRole(row.original.role || 'user')
                setEditActive(row.original.isActive)
                setEditError(null)
                setEditDrawerOpen(true)
              }}
            >
              <i className='ri-edit-line text-textSecondary' />
            </IconButton>
          </div>
        )
      })
    ],
    [router, locale]
  )

  const table = useReactTable({
    data: filteredUsers,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } }
  })

  const handleSaveEdit = async () => {
    if (!selectedUser) return

    setSaving(true)
    setEditError(null)

    try {
      await updateUserByAdmin(selectedUser.id, {
        role: editRole,
        isActive: editActive
      })

      // Update local state
      setUsers(prev =>
        prev.map(u =>
          u.id === selectedUser.id ? { ...u, role: editRole, isActive: editActive } : u
        )
      )

      setEditDrawerOpen(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!selectedUser) return

    setSaving(true)
    setEditError(null)

    try {
      await deactivateUser(selectedUser.id)

      setUsers(prev =>
        prev.map(u =>
          u.id === selectedUser.id ? { ...u, isActive: false } : u
        )
      )

      setEditDrawerOpen(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error al desactivar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Filters */}
      <div className='flex flex-wrap gap-4 p-4'>
        <TextField
          size='small'
          placeholder='Buscar usuario...'
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className='min-is-[200px]'
          slotProps={{
            input: {
              startAdornment: <i className='ri-search-line text-textSecondary mie-2' />
            }
          }}
        />
        <TextField
          select
          size='small'
          label='Rol'
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className='min-is-[120px]'
        >
          <MenuItem value=''>Todos</MenuItem>
          <MenuItem value='admin'>Admin</MenuItem>
          <MenuItem value='user'>Usuario</MenuItem>
        </TextField>
        <TextField
          select
          size='small'
          label='Estado'
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className='min-is-[120px]'
        >
          <MenuItem value=''>Todos</MenuItem>
          <MenuItem value='active'>Activo</MenuItem>
          <MenuItem value='inactive'>Inactivo</MenuItem>
        </TextField>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='is-full' style={{ borderCollapse: 'collapse' }}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className='border-be bg-backgroundDefault'>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className='plb-3 pli-4 text-start font-medium text-textSecondary'
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='text-center plb-8 text-textSecondary'>
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className='border-be hover:bg-actionHover'>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className='plb-3 pli-4'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TablePagination
        component='div'
        count={table.getFilteredRowModel().rows.length}
        rowsPerPage={table.getState().pagination.pageSize}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        labelRowsPerPage='Filas por página'
      />

      {/* Edit Drawer */}
      <Drawer
        anchor='right'
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        <div className='flex flex-col gap-6 p-6'>
          <div className='flex justify-between items-center'>
            <Typography variant='h6'>Editar Usuario</Typography>
            <IconButton onClick={() => setEditDrawerOpen(false)}>
              <i className='ri-close-line' />
            </IconButton>
          </div>

          {editError && <Alert severity='error'>{editError}</Alert>}

          {selectedUser && (
            <>
              <div className='flex items-center gap-3'>
                <Avatar src={selectedUser.image || ''} alt={selectedUser.name || ''} />
                <div>
                  <Typography className='font-medium'>{selectedUser.name}</Typography>
                  <Typography variant='body2' className='text-textSecondary'>
                    {selectedUser.email}
                  </Typography>
                </div>
              </div>

              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select value={editRole} label='Rol' onChange={e => setEditRole(e.target.value)}>
                  <MenuItem value='user'>Usuario</MenuItem>
                  <MenuItem value='admin'>Admin</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
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

              <div className='flex gap-4'>
                <Button variant='contained' onClick={handleSaveEdit} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button variant='outlined' color='error' onClick={handleDeactivate} disabled={saving || !selectedUser.isActive}>
                  Desactivar
                </Button>
              </div>
            </>
          )}
        </div>
      </Drawer>
    </>
  )
}

export default UserListTable
