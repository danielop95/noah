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

import CourseDrawer from './CourseDrawer'
import { deleteCourse } from '@/app/server/institutoActions'
import type { CourseWithLevels } from '@/app/server/institutoActions'
import ExportButton from '@/components/ExportButton'
import type { ExportColumn } from '@/components/ExportButton'

type CourseListTableProps = {
  courses: CourseWithLevels[]
  onRefresh: () => void
}

const fuzzyFilter: FilterFn<CourseWithLevels> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)

  addMeta({ itemRank })

  return itemRank.passed
}

const columnHelper = createColumnHelper<CourseWithLevels>()

const CourseListTable = ({ courses: initialCourses, onRefresh }: CourseListTableProps) => {
  const router = useRouter()
  const [courses, setCourses] = useState(initialCourses)
  const [globalFilter, setGlobalFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseWithLevels | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<CourseWithLevels | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useMemo(() => {
    setCourses(initialCourses)
  }, [initialCourses])

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      if (typeFilter !== 'all' && course.evaluationType !== typeFilter) return false
      if (statusFilter === 'active' && !course.isActive) return false
      if (statusFilter === 'inactive' && course.isActive) return false

      return true
    })
  }, [courses, typeFilter, statusFilter])

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Curso',
        cell: ({ row }) => {
          const course = row.original
          const icon =
            course.evaluationType === 'graded'
              ? 'solar-chart-2-linear'
              : 'solar-user-check-rounded-linear'

          return (
            <Box
              className='flex items-center gap-3 cursor-pointer'
              onClick={() => router.push(`/dashboard/instituto/cursos/${course.id}`)}
              sx={{ '&:hover': { opacity: 0.8 } }}
            >
              <Box
                sx={{
                  bgcolor: course.evaluationType === 'graded' ? 'primary.light' : 'warning.light',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className={`${icon} text-xl`} />
              </Box>
              <Box>
                <Typography variant='body2' className='font-medium' color='primary'>
                  {course.name}
                </Typography>
                {course.description && (
                  <Typography variant='caption' className='text-textSecondary line-clamp-1'>
                    {course.description}
                  </Typography>
                )}
              </Box>
            </Box>
          )
        }
      }),
      columnHelper.accessor('evaluationType', {
        header: 'Tipo',
        cell: ({ row }) => {
          const type = row.original.evaluationType

          return (
            <Chip
              label={type === 'graded' ? 'Con calificaciones' : 'Asistencia'}
              size='small'
              color={type === 'graded' ? 'success' : 'warning'}
              variant='tonal'
            />
          )
        }
      }),
      columnHelper.accessor('levels', {
        header: 'Niveles',
        cell: ({ row }) => (
          <Chip
            label={row.original.levels.length}
            size='small'
            color='default'
            variant='outlined'
          />
        )
      }),
      columnHelper.accessor(row => row._count.cohorts, {
        id: 'cohorts',
        header: 'Cohortes',
        cell: ({ getValue }) => (
          <Typography variant='body2'>{getValue()}</Typography>
        )
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
                onClick={() => router.push(`/dashboard/instituto/cursos/${row.original.id}`)}
              >
                <i className='ri-eye-line' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Editar'>
              <IconButton
                size='small'
                onClick={() => {
                  setSelectedCourse(row.original)
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
                  setCourseToDelete(row.original)
                  setDeleteError(null)
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
    [router]
  )

  const table = useReactTable({
    data: filteredCourses,
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

  const courseExportColumns: ExportColumn[] = [
    { header: 'Nombre', accessor: r => (r as CourseWithLevels).name, width: 24 },
    {
      header: 'Tipo',
      accessor: r =>
        (r as CourseWithLevels).evaluationType === 'graded' ? 'Con calificaciones' : 'Asistencia',
      width: 18
    },
    { header: 'Niveles', accessor: r => String((r as CourseWithLevels).levels.length), width: 10 },
    { header: 'Estado', accessor: r => ((r as CourseWithLevels).isActive ? 'Activo' : 'Inactivo'), width: 10 }
  ]

  const handleDelete = async () => {
    if (!courseToDelete) return

    setDeleting(true)
    setDeleteError(null)

    try {
      await deleteCourse(courseToDelete.id)
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
      onRefresh()
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Error al eliminar el curso')
    } finally {
      setDeleting(false)
    }
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setSelectedCourse(null)
  }

  return (
    <>
      <Box className='flex flex-wrap gap-4 p-4 items-center justify-between'>
        <Box className='flex flex-wrap gap-3 items-center'>
          <TextField
            size='small'
            placeholder='Buscar curso...'
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
          <FormControl size='small' sx={{ minWidth: 170 }}>
            <InputLabel>Tipo</InputLabel>
            <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} label='Tipo'>
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='graded'>Con calificaciones</MenuItem>
              <MenuItem value='pass_fail'>Solo asistencia</MenuItem>
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
        <Box className='flex gap-2'>
          <ExportButton data={filteredCourses} columns={courseExportColumns} fileName='cursos' title='Cursos' />
          <Button
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            onClick={() => {
              setSelectedCourse(null)
              setDrawerOpen(true)
            }}
          >
            Nuevo Curso
          </Button>
        </Box>
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
                    <i className='solar-notebook-linear text-5xl text-textSecondary' />
                    <Typography variant='body1' className='text-textSecondary'>
                      No hay cursos registrados
                    </Typography>
                    <Button
                      variant='outlined'
                      size='small'
                      onClick={() => {
                        setSelectedCourse(null)
                        setDrawerOpen(true)
                      }}
                    >
                      Crear primer curso
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
        labelRowsPerPage='Filas por página:'
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
      />

      <CourseDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        course={selectedCourse}
        onRefresh={onRefresh}
      />

      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Curso</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de eliminar el curso <strong>{courseToDelete?.name}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
          {deleteError && (
            <Typography color='error' variant='body2' sx={{ mt: 2 }}>
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

export default CourseListTable
