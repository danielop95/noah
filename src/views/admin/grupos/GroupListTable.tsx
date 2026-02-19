'use client'

import { useState, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { FilterFn } from '@tanstack/react-table'

import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TablePagination from '@mui/material/TablePagination'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import AvatarGroup from '@mui/material/AvatarGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'

import GroupDrawer from './GroupDrawer'
import { deleteGroup } from '@/app/server/groupActions'
import type { GroupWithDetails, NetworkOption } from '@/app/server/groupActions'

type GroupListTableProps = {
  groups: GroupWithDetails[]
  networks: NetworkOption[]
  onRefresh: () => void
}

const fuzzyFilter: FilterFn<GroupWithDetails> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<GroupWithDetails>()

const DAYS_LABELS: Record<string, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miercoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sabado',
  domingo: 'Domingo'
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

const GroupListTable = ({ groups: initialGroups, networks, onRefresh }: GroupListTableProps) => {
  const router = useRouter()
  const [groups, setGroups] = useState(initialGroups)
  const [globalFilter, setGlobalFilter] = useState('')
  const [networkFilter, setNetworkFilter] = useState<string>('all')
  const [modalityFilter, setModalityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<GroupWithDetails | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<GroupWithDetails | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Sincronizar con props
  useMemo(() => {
    setGroups(initialGroups)
  }, [initialGroups])

  const filteredGroups = useMemo(() => {
    return groups.filter(group => {
      if (networkFilter !== 'all' && group.networkId !== networkFilter) return false
      if (modalityFilter !== 'all' && group.modality !== modalityFilter) return false
      if (statusFilter === 'active' && !group.isActive) return false
      if (statusFilter === 'inactive' && group.isActive) return false

      return true
    })
  }, [groups, networkFilter, modalityFilter, statusFilter])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Grupo',
        cell: ({ row }) => {
          const group = row.original

          return (
            <Box
              className='flex items-center gap-3 cursor-pointer'
              onClick={() => router.push(`/dashboard/admin/grupos/${group.id}`)}
              sx={{ '&:hover': { opacity: 0.8 } }}
            >
              <Avatar src={group.imageUrl || undefined} variant='rounded' sx={{ bgcolor: 'grey.400', fontWeight: 600 }}>
                {getInitials(group.name)}
              </Avatar>
              <Box>
                <Typography variant='body2' className='font-medium' color='primary'>
                  {group.name}
                </Typography>
                {group.description && (
                  <Typography variant='caption' className='text-textSecondary line-clamp-1'>
                    {group.description}
                  </Typography>
                )}
              </Box>
            </Box>
          )
        }
      }),
      columnHelper.accessor('network.name', {
        header: 'Red',
        cell: ({ row }) => (
          <Chip label={row.original.network.name} size='small' variant='outlined' color='primary' />
        )
      }),
      columnHelper.accessor('leaders', {
        header: 'Lideres',
        cell: ({ row }) => {
          const leaders = row.original.leaders

          if (leaders.length === 0) {
            return <Typography variant='caption' className='text-textSecondary'>Sin lideres</Typography>
          }

          return (
            <AvatarGroup max={3} sx={{ justifyContent: 'flex-start' }}>
              {leaders.map(({ user }) => {
                const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Usuario'

                return (
                  <Tooltip key={user.id} title={displayName}>
                    <Avatar src={user.image || undefined} sx={{ width: 32, height: 32 }}>
                      {displayName.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                )
              })}
            </AvatarGroup>
          )
        }
      }),
      columnHelper.accessor('modality', {
        header: 'Modalidad',
        cell: ({ row }) => {
          const modality = row.original.modality

          return (
            <Chip
              icon={<i className={modality === 'virtual' ? 'ri-video-line' : 'ri-map-pin-line'} />}
              label={modality === 'virtual' ? 'Virtual' : 'Presencial'}
              size='small'
              color={modality === 'virtual' ? 'info' : 'primary'}
              variant='tonal'
            />
          )
        }
      }),
      columnHelper.accessor('meetingDay', {
        header: 'Horario',
        cell: ({ row }) => {
          const { meetingDay, meetingTime } = row.original

          if (!meetingDay) {
            return <Typography variant='caption' className='text-textSecondary'>-</Typography>
          }

          return (
            <Box className='flex items-center gap-1'>
              <i className='ri-time-line text-textSecondary' />
              <Typography variant='body2'>
                {DAYS_LABELS[meetingDay] || meetingDay} {meetingTime || ''}
              </Typography>
            </Box>
          )
        }
      }),
      columnHelper.accessor('isActive', {
        header: 'Estado',
        cell: ({ row }) => (
          <Chip
            label={row.original.isActive ? 'Activo' : 'Inactivo'}
            size='small'
            color={row.original.isActive ? 'success' : 'default'}
            variant='tonal'
          />
        )
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <Box className='flex gap-1'>
            <Tooltip title='Ver detalle'>
              <IconButton
                size='small'
                onClick={() => router.push(`/dashboard/admin/grupos/${row.original.id}`)}
              >
                <i className='ri-eye-line' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Editar'>
              <IconButton
                size='small'
                onClick={() => {
                  setSelectedGroup(row.original)
                  setDrawerOpen(true)
                }}
              >
                <i className='ri-edit-line' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Eliminar'>
              <IconButton
                size='small'
                color='error'
                onClick={() => {
                  setGroupToDelete(row.original)
                  setDeleteDialogOpen(true)
                }}
              >
                <i className='ri-delete-bin-line' />
              </IconButton>
            </Tooltip>
          </Box>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: filteredGroups,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 }
    }
  })

  const handleDelete = async () => {
    if (!groupToDelete) return

    setDeleting(true)

    try {
      await deleteGroup(groupToDelete.id)
      setDeleteDialogOpen(false)
      setGroupToDelete(null)
      onRefresh()
    } catch (error) {
      console.error('Error al eliminar grupo:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setSelectedGroup(null)
  }

  return (
    <>
      <Box className='flex flex-wrap gap-4 p-4 items-center justify-between'>
        <Box className='flex flex-wrap gap-3 items-center'>
          <TextField
            size='small'
            placeholder='Buscar grupo...'
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>Red</InputLabel>
            <Select value={networkFilter} onChange={e => setNetworkFilter(e.target.value)} label='Red'>
              <MenuItem value='all'>Todas</MenuItem>
              {networks.map(network => (
                <MenuItem key={network.id} value={network.id}>
                  {network.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size='small' sx={{ minWidth: 130 }}>
            <InputLabel>Modalidad</InputLabel>
            <Select value={modalityFilter} onChange={e => setModalityFilter(e.target.value)} label='Modalidad'>
              <MenuItem value='all'>Todas</MenuItem>
              <MenuItem value='presencial'>Presencial</MenuItem>
              <MenuItem value='virtual'>Virtual</MenuItem>
            </Select>
          </FormControl>
          <FormControl size='small' sx={{ minWidth: 120 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label='Estado'>
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='active'>Activos</MenuItem>
              <MenuItem value='inactive'>Inactivos</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          onClick={() => {
            setSelectedGroup(null)
            setDrawerOpen(true)
          }}
        >
          Nuevo Grupo
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align='center' sx={{ py: 8 }}>
                  <Box className='flex flex-col items-center gap-2'>
                    <i className='ri-team-line text-5xl text-textSecondary' />
                    <Typography variant='body1' className='text-textSecondary'>
                      No hay grupos registrados
                    </Typography>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => {
                        setSelectedGroup(null)
                        setDrawerOpen(true)
                      }}
                    >
                      Crear primer grupo
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} hover>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component='div'
        count={table.getFilteredRowModel().rows.length}
        page={table.getState().pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
        rowsPerPage={table.getState().pagination.pageSize}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage='Filas por pagina:'
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      <GroupDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        group={selectedGroup}
        networks={networks}
        onRefresh={onRefresh}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Grupo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estas seguro de eliminar el grupo <strong>{groupToDelete?.name}</strong>? Esta accion no se puede deshacer.
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

export default GroupListTable
