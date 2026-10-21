'use client'

import { useState } from 'react'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import DialogContentText from '@mui/material/DialogContentText'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'

import { useRouter } from 'next/navigation'

import {
  createVacationPeriod,
  updateVacationPeriod,
  deleteVacationPeriod,
  type VacationPeriodData
} from '@/app/server/adminActions'

type VacationPeriodsCardProps = {
  initialPeriods: VacationPeriodData[]
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatDateForInput = (date: Date): string => {
  const d = new Date(date)

  return d.toISOString().split('T')[0]
}

const getStatus = (startDate: Date, endDate: Date): { label: string; color: 'success' | 'info' | 'default' } => {
  const now = new Date()

  now.setHours(0, 0, 0, 0)

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (now >= start && now <= end) return { label: 'Activo', color: 'success' }
  if (now < start) return { label: 'Futuro', color: 'info' }

  return { label: 'Pasado', color: 'default' }
}

const VacationPeriodsCard = ({ initialPeriods }: VacationPeriodsCardProps) => {
  const router = useRouter()
  const [periods, setPeriods] = useState(initialPeriods)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPeriod, setEditingPeriod] = useState<VacationPeriodData | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [periodToDelete, setPeriodToDelete] = useState<VacationPeriodData | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setName('')
    setStartDate('')
    setEndDate('')
    setError(null)
    setEditingPeriod(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleOpenEdit = (period: VacationPeriodData) => {
    setEditingPeriod(period)
    setName(period.name || '')
    setStartDate(formatDateForInput(period.startDate))
    setEndDate(formatDateForInput(period.endDate))
    setError(null)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      setError('Debe seleccionar fecha de inicio y fin')

      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('La fecha de inicio debe ser anterior o igual a la fecha de fin')

      return
    }

    setSaving(true)
    setError(null)

    try {
      if (editingPeriod) {
        const updated = await updateVacationPeriod(editingPeriod.id, {
          name: name || null,
          startDate,
          endDate
        })

        setPeriods(prev => prev.map(p => (p.id === updated.id ? updated : p)))
      } else {
        const created = await createVacationPeriod({
          name: name || undefined,
          startDate,
          endDate
        })

        setPeriods(prev => [created, ...prev])
      }

      setDialogOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!periodToDelete) return

    setDeleting(true)

    try {
      await deleteVacationPeriod(periodToDelete.id)
      setPeriods(prev => prev.filter(p => p.id !== periodToDelete.id))
      setDeleteDialogOpen(false)
      setPeriodToDelete(null)
      router.refresh()
    } catch (err) {
      console.error('Error deleting vacation period:', err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader
          title='Periodos de Vacaciones de Grupos de Amistad'
          subheader='Durante estos periodos los grupos no necesitan reportar sus reuniones'
          action={
            <Button
              variant='contained'
              size='small'
              startIcon={<i className='solar-add-circle-linear' />}
              onClick={handleOpenCreate}
            >
              Agregar periodo
            </Button>
          }
        />
        <CardContent>
          {periods.length === 0 ? (
            <Box className='text-center py-8'>
              <Typography color='text.secondary'>No hay periodos de vacaciones definidos</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Fecha inicio</TableCell>
                    <TableCell>Fecha fin</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align='right'>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {periods.map(period => {
                    const status = getStatus(period.startDate, period.endDate)

                    return (
                      <TableRow key={period.id}>
                        <TableCell>{period.name || '—'}</TableCell>
                        <TableCell>{formatDate(period.startDate)}</TableCell>
                        <TableCell>{formatDate(period.endDate)}</TableCell>
                        <TableCell>
                          <Chip label={status.label} color={status.color} size='small' variant='tonal' />
                        </TableCell>
                        <TableCell align='right'>
                          <Tooltip title='Editar'>
                            <IconButton size='small' onClick={() => handleOpenEdit(period)}>
                              <i className='solar-pen-linear' />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title='Eliminar'>
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => {
                                setPeriodToDelete(period)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <i className='solar-trash-bin-trash-linear' />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='xs' fullWidth>
        <DialogTitle>{editingPeriod ? 'Editar Periodo' : 'Nuevo Periodo de Vacaciones'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity='error' className='mb-4' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Box className='flex flex-col gap-4 mt-2'>
            <TextField
              label='Nombre (opcional)'
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              placeholder='Ej: Vacaciones Diciembre 2026'
            />
            <TextField
              type='date'
              label='Fecha inicio'
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              type='date'
              label='Fecha fin'
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant='contained' disabled={saving}>
            {saving ? 'Guardando...' : editingPeriod ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Eliminar Periodo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de eliminar el periodo{' '}
            <strong>{periodToDelete?.name || `${formatDate(periodToDelete?.startDate || new Date())} - ${formatDate(periodToDelete?.endDate || new Date())}`}</strong>
            ?
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

export default VacationPeriodsCard
