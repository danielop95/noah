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

import CohortDrawer from './CohortDrawer'
import { deleteCohort } from '@/app/server/institutoActions'
import type { CohortWithDetails, CourseWithLevels } from '@/app/server/institutoActions'

type CohortListTableProps = {
  cohorts: CohortWithDetails[]
  courses: CourseWithLevels[]
  onRefresh: () => void
}

const fuzzyFilter: FilterFn<CohortWithDetails> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<CohortWithDetails>()

const DAYS_LABELS: Record<string, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miercoles',
  miércoles: 'Miercoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sabado',
  sábado: 'Sabado',
  domingo: 'Domingo'
}

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Por iniciar',
  active: 'Activa',
  completed: 'Completada',
  cancelled: 'Cancelada'
}

const STATUS_COLORS: Record<string, 'info' | 'success' | 'default' | 'error'> = {
  upcoming: 'info',
  active: 'success',
  completed: 'default',
  cancelled: 'error'
}

const formatDate = (date: Date | string) => {
  const d = new Date(date)

  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

const getTeacherName = (teacher: CohortWithDetails['teacher']) => {
  if (teacher.name) return teacher.name

  return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Sin maestro'
}

const getCohortDisplayName = (cohort: CohortWithDetails) => {
  if (cohort.name) return cohort.name

  return `${cohort.level.course.name} — ${cohort.level.name}`
}

const CohortListTable = ({ cohorts: initialCohorts, courses, onRefresh }: CohortListTableProps) => {
  const router = useRouter()
  const [cohorts, setCohorts] = useState(initialCohorts)
  const [globalFilter, setGlobalFilter] = useState('')
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCohort, setSelectedCohort] = useState<CohortWithDetails | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cohortToDelete, setCohortToDelete] = useState<CohortWithDetails | null>(null)
  const [deleting, setDeleting] = useState(false)

  useMemo(() => {
    setCohorts(initialCohorts)
  }, [initialCohorts])

  const filteredCohorts = useMemo(() => {
    return cohorts.filter(cohort => {
      if (courseFilter !== 'all' && cohort.level.course.id !== courseFilter) return false
      if (statusFilter !== 'all' && cohort.status !== statusFilter) return false

      return true
    })
  }, [cohorts, courseFilter, statusFilter])

  const uniqueCourses = useMemo(() => {
    const seen = new Set<string>()

    return cohorts
      .map(c => c.level.course)
      .filter(course => {
        if (seen.has(course.id)) return false
        seen.add(course.id)

        return true
      })
  }, [cohorts])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Cohorte',
        cell: ({ row }) => {
          const cohort = row.original
          const displayName = getCohortDisplayName(cohort)

          return (
            <Box
              className='flex flex-col gap-1 cursor-pointer'
              onClick={() => router.push(`/dashboard/instituto/cohortes/${cohort.id}`)}
              sx={{ '&:hover': { opacity: 0.8 } }}
            >
              <Typography variant='body2' className='font-medium' color='primary'>
                {displayName}
              </Typography>
              <Chip
                label={cohort.level.course.name}
                size='small'
                variant='outlined'
                color='secondary'
                sx={{ alignSelf: 'flex-start', fontSize: '0.7rem' }}
              />
            </Box>
          )
        }
      }),
      columnHelper.accessor('teacher', {
        header: 'Maestro',
        cell: ({ row }) => {
          const teacher = row.original.teacher
          const name = getTeacherName(teacher)

          return (
            <Box className='flex items-center gap-2'>
              <Avatar src={teacher.image || undefined} sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                {getInitials(name)}
              </Avatar>
              <Typography variant='body2'>{name}</Typography>
            </Box>
          )
        }
      }),
      columnHelper.accessor('weekDay', {
        header: 'Horario',
        cell: ({ row }) => {
          const { weekDay, startTime } = row.original

          return (
            <Box className='flex items-center gap-1'>
              <i className='solar-clock-circle-linear text-textSecondary' />
              <Typography variant='body2'>
                {DAYS_LABELS[weekDay] || weekDay} {startTime}
              </Typography>
            </Box>
          )
        }
      }),
      columnHelper.accessor('startDate', {
        header: 'Período',
        cell: ({ row }) => {
          const { startDate, endDate } = row.original

          return (
            <Typography variant='body2'>
              {formatDate(startDate)} → {formatDate(endDate)}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('_count', {
        header: 'Inscritos',
        cell: ({ row }) => {
          const { _count, maxCapacity } = row.original
          const enrolled = _count.enrollments
          const isFull = enrolled >= maxCapacity

          return (
            <Typography variant='body2' color={isFull ? 'error' : 'text.primary'}>
              {enrolled}/{maxCapacity}
            </Typography>
          )
        }
      }),
      columnHelper.accessor('status', {
        header: 'Estado',
        cell: ({ row }) => {
          const status = row.original.status

          return (
            <Chip
              label={STATUS_LABELS[status] || status}
              size='small'
              color={STATUS_COLORS[status] || 'default'}
              variant='tonal'
            />
          )
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: ({ row }) => (
          <Box className='flex gap-1'>
            <Tooltip title='Ver detalle'>
              <IconButton
                size='small'
                onClick={() => router.push(`/dashboard/instituto/cohortes/${row.original.id}`)}
              >
                <i className='solar-eye-linear' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Editar'>
              <IconButton
                size='small'
                onClick={() => {
                  setSelectedCohort(row.original)
                  setDrawerOpen(true)
                }}
              >
                <i className='solar-pen-linear' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Eliminar'>
              <IconButton
                size='small'
                color='error'
                onClick={() => {
                  setCohortToDelete(row.original)
                  setDeleteDialogOpen(true)
                }}
              >
                <i className='solar-trash-bin-trash-linear' />
              </IconButton>
            </Tooltip>
          </Box>
        )
      })
    ],
    []
  )

  const table = useReactTable({
    data: filteredCohorts,
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
    if (!cohortToDelete) return

    setDeleting(true)

    try {
      await deleteCohort(cohortToDelete.id)
      setDeleteDialogOpen(false)
      setCohortToDelete(null)
      onRefresh()
    } catch (error) {
      console.error('Error al eliminar cohorte:', error)
    } finally {
      setDeleting(false)
    }
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setSelectedCohort(null)
  }

  return (
    <>
      <Box className='flex flex-wrap gap-4 p-4 items-center justify-between'>
        <Box className='flex flex-wrap gap-3 items-center'>
          <TextField
            size='small'
            placeholder='Buscar cohorte...'
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='solar-magnifer-linear' />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size='small' sx={{ minWidth: 160 }}>
            <InputLabel>Curso</InputLabel>
            <Select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} label='Curso'>
              <MenuItem value='all'>Todos</MenuItem>
              {uniqueCourses.map(course => (
                <MenuItem key={course.id} value={course.id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size='small' sx={{ minWidth: 140 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} label='Estado'>
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='upcoming'>Por iniciar</MenuItem>
              <MenuItem value='active'>Activa</MenuItem>
              <MenuItem value='completed'>Completada</MenuItem>
              <MenuItem value='cancelled'>Cancelada</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='solar-add-circle-linear' />}
          onClick={() => {
            setSelectedCohort(null)
            setDrawerOpen(true)
          }}
        >
          Nueva Cohorte
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
                    <i className='solar-book-linear text-5xl text-textSecondary' />
                    <Typography variant='body1' className='text-textSecondary'>
                      No hay cohortes registradas
                    </Typography>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => {
                        setSelectedCohort(null)
                        setDrawerOpen(true)
                      }}
                    >
                      Crear primera cohorte
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

      <CohortDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        cohort={selectedCohort}
        courses={courses}
        onRefresh={onRefresh}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Cohorte</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estas seguro de eliminar la cohorte{' '}
            <strong>{cohortToDelete ? getCohortDisplayName(cohortToDelete) : ''}</strong>? Esta accion eliminara tambien
            todas las sesiones y registros de asistencia. No se puede deshacer.
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

export default CohortListTable
