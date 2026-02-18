'use client'

import { useMemo, useState } from 'react'

import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Typography from '@mui/material/Typography'
import TablePagination from '@mui/material/TablePagination'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

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

import type { UserOption } from './UserMultiSelect'
import NetworkDrawer from './NetworkDrawer'
import { deleteNetwork } from '@/app/server/networkActions'

type NetworkUser = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  image: string | null
  email: string | null
  networkRole: string | null
}

type NetworkRow = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: Date
  users: NetworkUser[]
  _count: { users: number }
}

const fuzzyFilter: FilterFn<NetworkRow> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<NetworkRow>()

const getDisplayName = (user: NetworkUser) =>
  user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Sin nombre'

type NetworkListTableProps = {
  networks: NetworkRow[]
  users: UserOption[]
  onRefresh: () => void
}

const NetworkListTable = ({ networks: initialNetworks, users, onRefresh }: NetworkListTableProps) => {
  const [networks, setNetworks] = useState(initialNetworks)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkRow | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [networkToDelete, setNetworkToDelete] = useState<NetworkRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filteredNetworks = useMemo(() => {
    return networks.filter(network => {
      if (statusFilter === 'active' && !network.isActive) return false
      if (statusFilter === 'inactive' && network.isActive) return false

      return true
    })
  }, [networks, statusFilter])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Red',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar
              src={row.original.imageUrl || undefined}
              sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
              variant='rounded'
            >
              <i className='ri-bubble-chart-line' />
            </Avatar>
            <div>
              <Typography className='font-medium' color='text.primary'>
                {row.original.name}
              </Typography>
              {row.original.description && (
                <Typography variant='caption' className='text-textSecondary line-clamp-1'>
                  {row.original.description}
                </Typography>
              )}
            </div>
          </div>
        )
      }),
      columnHelper.display({
        id: 'leaders',
        header: 'Lideres',
        cell: ({ row }) => {
          const leaders = row.original.users.filter(u => u.networkRole === 'leader')

          if (leaders.length === 0) {
            return <Typography variant='body2' className='text-textSecondary'>-</Typography>
          }

          return (
            <Tooltip
              title={
                <div>
                  {leaders.map(l => (
                    <div key={l.id}>{getDisplayName(l)}</div>
                  ))}
                </div>
              }
            >
              <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
                {leaders.map(l => (
                  <Avatar key={l.id} src={l.image || undefined} sx={{ width: 28, height: 28 }}>
                    {getDisplayName(l).charAt(0)}
                  </Avatar>
                ))}
              </AvatarGroup>
            </Tooltip>
          )
        }
      }),
      columnHelper.display({
        id: 'members',
        header: 'Miembros',
        cell: ({ row }) => {
          const count = row.original.users.filter(u => u.networkRole === 'member').length

          return (
            <Chip label={`${count} miembro${count !== 1 ? 's' : ''}`} size='small' variant='tonal' color='secondary' />
          )
        }
      }),
      columnHelper.accessor('isActive', {
        header: 'Estado',
        cell: ({ getValue }) => (
          <Chip
            label={getValue() ? 'Activa' : 'Inactiva'}
            color={getValue() ? 'success' : 'error'}
            size='small'
            variant='tonal'
          />
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <div className='flex items-center gap-1'>
            <Tooltip title='Editar'>
              <IconButton
                size='small'
                onClick={() => {
                  setSelectedNetwork(row.original)
                  setDrawerOpen(true)
                }}
              >
                <i className='ri-edit-line text-textSecondary' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Eliminar'>
              <IconButton
                size='small'
                onClick={() => {
                  setNetworkToDelete(row.original)
                  setDeleteDialogOpen(true)
                }}
              >
                <i className='ri-delete-bin-line text-error' />
              </IconButton>
            </Tooltip>
          </div>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: filteredNetworks,
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

  const handleDelete = async () => {
    if (!networkToDelete) return

    setDeleting(true)

    try {
      await deleteNetwork(networkToDelete.id)
      setNetworks(prev => prev.filter(n => n.id !== networkToDelete.id))
      setDeleteDialogOpen(false)
      setNetworkToDelete(null)
    } catch (err) {
      console.error('Error deleting network:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleDrawerSuccess = () => {
    onRefresh()
  }

  const handleOpenCreate = () => {
    setSelectedNetwork(null)
    setDrawerOpen(true)
  }

  return (
    <>
      {/* Filters */}
      <div className='flex flex-wrap gap-4 p-4 justify-between items-center'>
        <div className='flex flex-wrap gap-4'>
          <TextField
            size='small'
            placeholder='Buscar red...'
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
            label='Estado'
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='min-is-[120px]'
          >
            <MenuItem value=''>Todos</MenuItem>
            <MenuItem value='active'>Activa</MenuItem>
            <MenuItem value='inactive'>Inactiva</MenuItem>
          </TextField>
        </div>
        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleOpenCreate}>
          Nueva Red
        </Button>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='is-full' style={{ borderCollapse: 'collapse' }}>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className='border-be bg-backgroundDefault'>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className='plb-3 pli-4 text-start font-medium text-textSecondary'>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className='text-center plb-8 text-textSecondary'>
                  No se encontraron redes
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
        labelRowsPerPage='Filas por pagina'
      />

      {/* Drawer */}
      <NetworkDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        network={selectedNetwork}
        users={users}
        onRefresh={onRefresh}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Red</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estas seguro que deseas eliminar la red <strong>{networkToDelete?.name}</strong>? Esta accion no se puede
            deshacer. Los usuarios de la red quedaran sin asignacion.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button onClick={handleDelete} color='error' variant='contained' disabled={deleting}>
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default NetworkListTable
