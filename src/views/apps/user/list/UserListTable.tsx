'use client'

// React Imports
import { useEffect, useMemo, useState } from 'react'

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
import { getRolesForAssignment } from '@/app/server/roleActions'

// Component Imports
import ExportButton from '@/components/ExportButton'
import type { ExportColumn } from '@/components/ExportButton'
import UserEditDrawer from '@/components/UserEditDrawer'

type UserRow = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  roleId: string | null
  userRole: { id: string; name: string; slug: string; hierarchy: number } | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  city: string | null
  isActive: boolean
  createdAt: Date
  networkId: string | null
  networkRole: string | null
  network: { id: string; name: string } | null
  groupId: string | null
  groupRole: string | null
  group: { id: string; name: string } | null
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
  const [availableRoles, setAvailableRoles] = useState<Array<{ id: string; name: string; slug: string; hierarchy: number }>>([])

  useEffect(() => {
    getRolesForAssignment().then(setAvailableRoles).catch(() => {})
  }, [])

  const router = useRouter()
  const { lang: locale } = useParams()

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (roleFilter && user.userRole?.slug !== roleFilter) return false
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
      columnHelper.accessor('userRole', {
        header: 'Rol',
        cell: ({ getValue }) => {
          const userRole = getValue()

          return (
            <Chip
              label={userRole?.name || 'Sin rol'}
              color={userRole && userRole.hierarchy <= 2 ? 'primary' : 'default'}
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
        header: 'Grupo',
        cell: ({ row }) => {
          const group = row.original.group
          const groupRole = row.original.groupRole

          if (!group) {
            return <Typography variant='body2' className='text-textSecondary'>-</Typography>
          }

          return (
            <Chip
              label={group.name}
              size='small'
              variant='tonal'
              color={groupRole === 'leader' ? 'success' : 'info'}
              icon={groupRole === 'leader' ? <i className='ri-star-line text-xs' /> : undefined}
            />
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

  const handleEditSaved = () => {
    router.refresh()
  }

  const userExportColumns: ExportColumn[] = [
    {
      header: 'Nombre',
      accessor: r => {
        const u = r as UserRow

        return u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sin nombre'
      },
      width: 24
    },
    { header: 'Email', accessor: r => (r as UserRow).email || '', width: 28 },
    { header: 'Teléfono', accessor: r => (r as UserRow).phone || '', width: 14 },
    { header: 'Rol', accessor: r => (r as UserRow).userRole?.name || 'Sin rol', width: 10 },
    { header: 'Red', accessor: r => (r as UserRow).network?.name || '', width: 16 },
    { header: 'Grupo', accessor: r => (r as UserRow).group?.name || '', width: 16 },
    { header: 'Estado', accessor: r => ((r as UserRow).isActive ? 'Activo' : 'Inactivo'), width: 10 },
    { header: 'Ciudad', accessor: r => (r as UserRow).city || '', width: 14 }
  ]

  return (
    <>
      {/* Filters */}
      <div className='flex flex-wrap gap-4 p-4 items-center'>
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
          {availableRoles.map(r => (
            <MenuItem key={r.id} value={r.slug}>{r.name}</MenuItem>
          ))}
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
        <div className='flex-grow' />
        <ExportButton
          data={filteredUsers}
          columns={userExportColumns}
          fileName='usuarios'
          title='Usuarios'
        />
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
      <UserEditDrawer
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        user={selectedUser}
        onSaved={handleEditSaved}
      />
    </>
  )
}

export default UserListTable
