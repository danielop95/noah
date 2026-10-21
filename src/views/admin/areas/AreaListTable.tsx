'use client'

import { useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

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
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

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

import AreaDrawer from './AreaDrawer'
import { deleteArea } from '@/app/server/areasActions'

export type AreaRow = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: { memberships: number; solicitudAreas: number }
}

const fuzzyFilter: FilterFn<AreaRow> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<AreaRow>()

type Props = {
  areas: AreaRow[]
  onRefresh: () => void
}

const AreaListTable = ({ areas: initialAreas, onRefresh }: Props) => {
  const router = useRouter()
  const [areas, setAreas] = useState(initialAreas)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState<AreaRow | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [areaToDelete, setAreaToDelete] = useState<AreaRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const filteredAreas = useMemo(() => {
    return areas.filter(a => {
      if (statusFilter === 'active' && !a.isActive) return false
      if (statusFilter === 'inactive' && a.isActive) return false

      return true
    })
  }, [areas, statusFilter])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Área',
        cell: ({ row }) => (
          <div className='flex items-center gap-3'>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: row.original.color || 'primary.main',
                color: '#fff'
              }}
              variant='rounded'
            >
              <i className={row.original.icon || 'solar-folder-linear'} />
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
        id: 'memberships',
        header: 'Miembros',
        cell: ({ row }) => (
          <Chip
            label={`${row.original._count.memberships} ${row.original._count.memberships === 1 ? 'miembro' : 'miembros'}`}
            size='small'
            variant='tonal'
            color='secondary'
          />
        )
      }),
      columnHelper.display({
        id: 'solicitudes',
        header: 'Solicitudes',
        cell: ({ row }) => (
          <Typography variant='body2' color='text.secondary'>
            {row.original._count.solicitudAreas}
          </Typography>
        )
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
            <Tooltip title='Ver'>
              <IconButton size='small' onClick={() => router.push(`/dashboard/admin/areas/${row.original.id}`)}>
                <i className='solar-eye-linear text-textSecondary' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Editar'>
              <IconButton
                size='small'
                onClick={() => {
                  setSelectedArea(row.original)
                  setDrawerOpen(true)
                }}
              >
                <i className='solar-pen-new-square-linear text-textSecondary' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Eliminar'>
              <IconButton
                size='small'
                onClick={() => {
                  setAreaToDelete(row.original)
                  setDeleteError(null)
                  setDeleteDialogOpen(true)
                }}
              >
                <i className='solar-trash-bin-trash-linear text-error' />
              </IconButton>
            </Tooltip>
          </div>
        )
      })
    ],
    [router]
  )

  const table = useReactTable({
    data: filteredAreas,
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
    if (!areaToDelete) return

    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteArea(areaToDelete.id)
      setAreas(prev => prev.filter(a => a.id !== areaToDelete.id))
      setDeleteDialogOpen(false)
      setAreaToDelete(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className='flex flex-wrap gap-4 p-4 justify-between items-center'>
        <div className='flex flex-wrap gap-4'>
          <TextField
            size='small'
            placeholder='Buscar área...'
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className='min-is-[200px]'
            slotProps={{
              input: {
                startAdornment: <i className='solar-magnifer-linear text-textSecondary mie-2' />
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
        <Button
          variant='contained'
          startIcon={<i className='solar-add-circle-linear' />}
          onClick={() => {
            setSelectedArea(null)
            setDrawerOpen(true)
          }}
        >
          Nueva Área
        </Button>
      </div>

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
                  No se encontraron áreas
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

      <AreaDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        area={selectedArea}
        onSuccess={() => {
          setDrawerOpen(false)
          onRefresh()
        }}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Área</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro que deseas eliminar <strong>{areaToDelete?.name}</strong>?
            Si tiene solicitudes asociadas, considera desactivarla en lugar de eliminarla.
          </DialogContentText>
          {deleteError && (
            <Typography variant='body2' color='error' className='mt-3'>
              {deleteError}
            </Typography>
          )}
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

export default AreaListTable
