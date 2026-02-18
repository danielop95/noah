'use client'

import { useState, useMemo } from 'react'

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
import Tooltip from '@mui/material/Tooltip'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'

import ReportDrawer from './ReportDrawer'
import ReportStatsCards from './ReportStatsCards'
import { deleteReport } from '@/app/server/reportActions'
import type { ReportWithDetails, GroupOptionForReports, ReportStats } from '@/app/server/reportActions'

type ReportListTableProps = {
  initialReports: ReportWithDetails[]
  groups: GroupOptionForReports[]
  networks: { id: string; name: string }[]
  isAdmin: boolean
  currentUserId: string
  onRefresh: () => void
}

const columnHelper = createColumnHelper<ReportWithDetails>()

const fuzzyFilter: FilterFn<ReportWithDetails> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)

  return d.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatCurrency = (value: number | null) => {
  if (!value) return '—'

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const ReportListTable = ({
  initialReports,
  groups,
  networks,
  isAdmin,
  currentUserId,
  onRefresh
}: ReportListTableProps) => {
  const [reports, setReports] = useState(initialReports)
  const [globalFilter, setGlobalFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [networkFilter, setNetworkFilter] = useState<string>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ReportWithDetails | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<ReportWithDetails | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      if (groupFilter !== 'all' && report.groupId !== groupFilter) return false
      if (networkFilter !== 'all' && report.group.network.id !== networkFilter) return false

      if (startDate) {
        const reportDate = new Date(report.meetingDate)
        const start = new Date(startDate)

        if (reportDate < start) return false
      }

      if (endDate) {
        const reportDate = new Date(report.meetingDate)
        const end = new Date(endDate)

        if (reportDate > end) return false
      }

      return true
    })
  }, [reports, groupFilter, networkFilter, startDate, endDate])

  // Calculate filtered stats
  const filteredStats: ReportStats = useMemo(() => {
    const totalAttendees = filteredReports.reduce((sum, r) => sum + r.totalAttendees, 0)

    return {
      totalReports: filteredReports.length,
      totalAttendees,
      totalLeaders: filteredReports.reduce((sum, r) => sum + r.leadersCount, 0),
      totalVisitors: filteredReports.reduce((sum, r) => sum + r.visitorsCount, 0),
      totalOffering: filteredReports.reduce((sum, r) => sum + Number(r.offeringAmount || 0), 0),
      averageAttendees: filteredReports.length > 0 ? Math.round(totalAttendees / filteredReports.length) : 0
    }
  }, [filteredReports])

  // Table columns
  const columns = useMemo(
    () => [
      columnHelper.accessor('meetingDate', {
        header: 'Fecha',
        cell: ({ getValue }) => (
          <Typography variant='body2' fontWeight={500}>
            {formatDate(getValue())}
          </Typography>
        )
      }),
      columnHelper.accessor('group.name', {
        header: 'Grupo',
        cell: ({ row }) => (
          <Box className='flex items-center gap-2'>
            <Avatar src={row.original.group.imageUrl || undefined} sx={{ width: 32, height: 32 }}>
              {row.original.group.name[0]}
            </Avatar>
            <Typography variant='body2'>{row.original.group.name}</Typography>
          </Box>
        )
      }),
      columnHelper.accessor('group.network.name', {
        header: 'Red',
        cell: ({ getValue }) => <Chip label={getValue()} size='small' variant='outlined' />
      }),
      columnHelper.display({
        id: 'attendance',
        header: 'Asistencia',
        cell: ({ row }) => {
          const { totalAttendees, leadersCount, visitorsCount } = row.original

          return (
            <Box>
              <Typography variant='body2' fontWeight={500}>
                {totalAttendees} asistentes
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {leadersCount} líderes, {visitorsCount} visitas
              </Typography>
            </Box>
          )
        }
      }),
      columnHelper.accessor('offeringAmount', {
        header: 'Ofrenda',
        cell: ({ getValue, row }) => {
          const amount = getValue()

          if (!row.original.reportOffering) {
            return (
              <Typography variant='body2' color='text.disabled'>
                —
              </Typography>
            )
          }

          return (
            <Typography variant='body2' fontWeight={500} color='success.main'>
              {formatCurrency(amount)}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('reporter.firstName', {
        header: 'Reportado por',
        cell: ({ row }) => {
          const reporter = row.original.reporter
          const name = reporter.firstName || reporter.name?.split(' ')[0] || 'Usuario'

          return (
            <Box className='flex items-center gap-2'>
              <Avatar src={reporter.image || undefined} sx={{ width: 24, height: 24 }}>
                {name[0]}
              </Avatar>
              <Typography variant='body2'>{name}</Typography>
            </Box>
          )
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => {
          const report = row.original
          const canEdit = report.reporterId === currentUserId
          const canDelete = isAdmin || report.reporterId === currentUserId

          return (
            <Box className='flex items-center gap-1'>
              {canEdit && (
                <Tooltip title='Editar'>
                  <IconButton
                    size='small'
                    onClick={() => {
                      setSelectedReport(report)
                      setDrawerOpen(true)
                    }}
                  >
                    <i className='ri-pencil-line text-lg' />
                  </IconButton>
                </Tooltip>
              )}
              {canDelete && (
                <Tooltip title='Eliminar'>
                  <IconButton
                    size='small'
                    color='error'
                    onClick={() => {
                      setReportToDelete(report)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <i className='ri-delete-bin-line text-lg' />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )
        }
      })
    ],
    [currentUserId, isAdmin]
  )

  const table = useReactTable({
    data: filteredReports,
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
    if (!reportToDelete) return

    setDeleting(true)

    try {
      await deleteReport(reportToDelete.id)
      setReports(prev => prev.filter(r => r.id !== reportToDelete.id))
      setDeleteDialogOpen(false)
      setReportToDelete(null)
      onRefresh()
    } catch (err) {
      console.error('Error deleting report:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleOpenCreate = () => {
    setSelectedReport(null)
    setDrawerOpen(true)
  }

  const clearFilters = () => {
    setGroupFilter('all')
    setNetworkFilter('all')
    setStartDate('')
    setEndDate('')
    setGlobalFilter('')
  }

  const hasActiveFilters = groupFilter !== 'all' || networkFilter !== 'all' || startDate || endDate || globalFilter

  return (
    <>
      {/* Stats Cards */}
      <Box className='mb-6'>
        <ReportStatsCards stats={filteredStats} />
      </Box>

      {/* Filters */}
      <Box className='flex flex-wrap gap-4 items-center p-4'>
        <TextField
          size='small'
          placeholder='Buscar...'
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          sx={{ minWidth: 200 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-search-line' />
                </InputAdornment>
              )
            }
          }}
        />

        <TextField
          select
          size='small'
          label='Grupo'
          value={groupFilter}
          onChange={e => setGroupFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value='all'>Todos los grupos</MenuItem>
          {groups.map(group => (
            <MenuItem key={group.id} value={group.id}>
              {group.name}
            </MenuItem>
          ))}
        </TextField>

        {isAdmin && networks.length > 0 && (
          <TextField
            select
            size='small'
            label='Red'
            value={networkFilter}
            onChange={e => setNetworkFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value='all'>Todas las redes</MenuItem>
            {networks.map(network => (
              <MenuItem key={network.id} value={network.id}>
                {network.name}
              </MenuItem>
            ))}
          </TextField>
        )}

        <TextField
          type='date'
          size='small'
          label='Desde'
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          sx={{ width: 150 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          type='date'
          size='small'
          label='Hasta'
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          sx={{ width: 150 }}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        {hasActiveFilters && (
          <Button variant='text' size='small' onClick={clearFilters} startIcon={<i className='ri-close-line' />}>
            Limpiar
          </Button>
        )}

        <Box className='flex-grow' />

        <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleOpenCreate}>
          Nuevo Reporte
        </Button>
      </Box>

      {/* Table */}
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
                  <Typography color='text.secondary'>
                    {hasActiveFilters ? 'No hay reportes que coincidan con los filtros' : 'No hay reportes registrados'}
                  </Typography>
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

      {/* Pagination */}
      <TablePagination
        component='div'
        count={table.getFilteredRowModel().rows.length}
        page={table.getState().pagination.pageIndex}
        rowsPerPage={table.getState().pagination.pageSize}
        onPageChange={(_, page) => table.setPageIndex(page)}
        onRowsPerPageChange={e => table.setPageSize(Number(e.target.value))}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage='Filas por página:'
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      {/* Drawer */}
      <ReportDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        report={selectedReport}
        groups={groups}
        onRefresh={onRefresh}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Reporte</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el reporte del grupo{' '}
            <strong>{reportToDelete?.group.name}</strong> del día{' '}
            <strong>{reportToDelete ? formatDate(reportToDelete.meetingDate) : ''}</strong>?
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

export default ReportListTable
