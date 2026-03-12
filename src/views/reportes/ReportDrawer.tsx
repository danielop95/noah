'use client'

import { useState, useEffect } from 'react'

import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import Avatar from '@mui/material/Avatar'

import { createReport, updateReport, checkReportExists } from '@/app/server/reportActions'
import type { ReportWithDetails, GroupOptionForReports } from '@/app/server/reportActions'

type ReportDrawerProps = {
  open: boolean
  onClose: () => void
  report: ReportWithDetails | null
  groups: GroupOptionForReports[]
  onRefresh: () => void
}

const DAYS_OF_WEEK = [
  { value: 'domingo', label: 'Domingo' },
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' }
]

const formatDateForInput = (date: Date | string | null): string => {
  if (!date) return ''

  const d = new Date(date)

  return d.toISOString().split('T')[0]
}

const ReportDrawer = ({ open, onClose, report, groups, onRefresh }: ReportDrawerProps) => {
  const isEditing = !!report

  // Form state
  const [groupId, setGroupId] = useState<string>('')
  const [meetingDate, setMeetingDate] = useState<string>('')
  const [totalAttendees, setTotalAttendees] = useState<number>(1)
  const [leadersCount, setLeadersCount] = useState<number>(1)
  const [visitorsCount, setVisitorsCount] = useState<number>(0)
  const [reportOffering, setReportOffering] = useState<boolean>(false)
  const [offeringAmount, setOfferingAmount] = useState<number>(0)
  const [notes, setNotes] = useState<string>('')

  // UI state
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [checkingDuplicate, setCheckingDuplicate] = useState(false)

  // Check for duplicate report when group or date changes
  useEffect(() => {
    if (!groupId || !meetingDate) {
      setDuplicateWarning(null)

      return
    }

    let cancelled = false

    const check = async () => {
      setCheckingDuplicate(true)

      try {
        const result = await checkReportExists(groupId, meetingDate, report?.id)

        if (!cancelled) {
          if (result.exists) {
            setDuplicateWarning(`Ya existe un reporte para este grupo en esta fecha (creado por ${result.reporterName})`)
          } else {
            setDuplicateWarning(null)
          }
        }
      } catch {
        // Ignore errors in background check
      } finally {
        if (!cancelled) setCheckingDuplicate(false)
      }
    }

    const timeout = setTimeout(check, 300)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [groupId, meetingDate, report?.id])

  // Reset form when report or open changes
  useEffect(() => {
    if (open) {
      if (report) {
        // Edit mode
        setGroupId(report.groupId)
        setMeetingDate(formatDateForInput(report.meetingDate))
        setTotalAttendees(report.totalAttendees)
        setLeadersCount(report.leadersCount)
        setVisitorsCount(report.visitorsCount)
        setReportOffering(report.reportOffering)
        setOfferingAmount(report.offeringAmount || 0)
        setNotes(report.notes || '')
      } else {
        // Create mode - reset all
        setGroupId(groups.length === 1 ? groups[0].id : '')
        setMeetingDate(new Date().toISOString().split('T')[0])
        setTotalAttendees(1)
        setLeadersCount(1)
        setVisitorsCount(0)
        setReportOffering(false)
        setOfferingAmount(0)
        setNotes('')
      }

      setError(null)
    }
  }, [report, open, groups])

  const handleClose = () => {
    if (!saving) {
      onClose()
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!groupId) {
      setError('Debe seleccionar un grupo')

      return
    }

    if (!meetingDate) {
      setError('Debe seleccionar una fecha')

      return
    }

    if (duplicateWarning) {
      setError('Ya existe un reporte para este grupo en esta fecha')

      return
    }

    if (totalAttendees < 1) {
      setError('El total de asistentes debe ser al menos 1')

      return
    }

    if (leadersCount > totalAttendees) {
      setError('El número de líderes no puede ser mayor al total de asistentes')

      return
    }

    if (visitorsCount > totalAttendees) {
      setError('El número de visitas no puede ser mayor al total de asistentes')

      return
    }

    if (reportOffering && offeringAmount <= 0) {
      setError('Si reporta ofrenda, debe indicar un monto válido')

      return
    }

    setSaving(true)
    setError(null)

    try {
      if (isEditing) {
        await updateReport(report.id, {
          meetingDate,
          totalAttendees,
          leadersCount,
          visitorsCount,
          reportOffering,
          offeringAmount: reportOffering ? offeringAmount : null,
          notes: notes || null
        })
      } else {
        await createReport({
          groupId,
          meetingDate,
          totalAttendees,
          leadersCount,
          visitorsCount,
          reportOffering,
          offeringAmount: reportOffering ? offeringAmount : undefined,
          notes: notes || undefined
        })
      }

      onRefresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el reporte')
    } finally {
      setSaving(false)
    }
  }

  const selectedGroup = groups.find(g => g.id === groupId)

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 } }
      }}
    >
      <Box className='flex flex-col h-full'>
        {/* Header */}
        <Box className='flex items-center justify-between p-4 border-b border-divider'>
          <Typography variant='h6'>{isEditing ? 'Editar Reporte' : 'Nuevo Reporte'}</Typography>
          <IconButton onClick={handleClose} disabled={saving}>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        {/* Content */}
        <Box className='flex-1 overflow-auto p-4'>
          {error && (
            <Alert severity='error' className='mb-4' onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Grupo */}
          <TextField
            select
            fullWidth
            label='Grupo'
            value={groupId}
            onChange={e => setGroupId(e.target.value)}
            disabled={isEditing || saving}
            className='mb-4'
            required
          >
            {groups.map(group => (
              <MenuItem key={group.id} value={group.id}>
                <Box className='flex items-center gap-2'>
                  <Avatar src={group.imageUrl || undefined} sx={{ width: 24, height: 24 }}>
                    {group.name[0]}
                  </Avatar>
                  <span>{group.name}</span>
                  <Typography variant='caption' color='text.secondary'>
                    ({group.network.name})
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </TextField>

          {/* Fecha */}
          <TextField
            fullWidth
            type='date'
            label='Fecha de la Reunión'
            value={meetingDate}
            onChange={e => setMeetingDate(e.target.value)}
            disabled={saving}
            className='mb-4'
            required
            error={!!duplicateWarning}
            helperText={duplicateWarning || (checkingDuplicate ? 'Verificando disponibilidad...' : undefined)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Divider className='my-4' />

          {/* Asistencia */}
          <Typography variant='subtitle2' className='mb-3'>
            Asistencia
          </Typography>

          <TextField
            fullWidth
            type='number'
            label='Total Asistentes'
            value={totalAttendees}
            onChange={e => setTotalAttendees(Math.max(1, parseInt(e.target.value) || 1))}
            disabled={saving}
            className='mb-4'
            required
            slotProps={{
              htmlInput: { min: 1 },
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='ri-group-line' />
                  </InputAdornment>
                )
              }
            }}
            helperText='Incluye a todos los asistentes (líderes y miembros)'
          />

          <Box className='flex gap-4 mb-4'>
            <TextField
              fullWidth
              type='number'
              label='Líderes'
              value={leadersCount}
              onChange={e => setLeadersCount(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={saving}
              slotProps={{
                htmlInput: { min: 0, max: totalAttendees },
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-star-line' />
                    </InputAdornment>
                  )
                }
              }}
              helperText='Del total, ¿cuántos eran líderes?'
            />

            <TextField
              fullWidth
              type='number'
              label='Visitas'
              value={visitorsCount}
              onChange={e => setVisitorsCount(Math.max(0, parseInt(e.target.value) || 0))}
              disabled={saving}
              slotProps={{
                htmlInput: { min: 0, max: totalAttendees },
                input: {
                  startAdornment: (
                    <InputAdornment position='start'>
                      <i className='ri-user-add-line' />
                    </InputAdornment>
                  )
                }
              }}
              helperText='¿Cuántos eran invitados nuevos?'
            />
          </Box>

          <Divider className='my-4' />

          {/* Ofrenda */}
          <Typography variant='subtitle2' className='mb-3'>
            Ofrenda / Diezmo
          </Typography>

          <FormControlLabel
            control={
              <Switch checked={reportOffering} onChange={e => setReportOffering(e.target.checked)} disabled={saving} />
            }
            label='¿Reportar ofrenda?'
            className='mb-3'
          />

          {reportOffering && (
            <TextField
              fullWidth
              type='number'
              label='Monto de Ofrenda'
              value={offeringAmount}
              onChange={e => setOfferingAmount(Math.max(0, parseFloat(e.target.value) || 0))}
              disabled={saving}
              className='mb-4'
              slotProps={{
                htmlInput: { min: 0, step: 1000 },
                input: {
                  startAdornment: <InputAdornment position='start'>$</InputAdornment>
                }
              }}
            />
          )}

          <Divider className='my-4' />

          {/* Notas */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label='Notas (opcional)'
            value={notes}
            onChange={e => setNotes(e.target.value)}
            disabled={saving}
            placeholder='Observaciones, testimonios, peticiones de oración...'
          />
        </Box>

        {/* Footer */}
        <Box className='flex justify-end gap-3 p-4 border-t border-divider'>
          <Button variant='outlined' onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant='contained' onClick={handleSubmit} disabled={saving || !!duplicateWarning}>
            {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default ReportDrawer
