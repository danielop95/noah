'use client'

import { useState, useEffect } from 'react'

import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import { createCourse, updateCourse } from '@/app/server/institutoActions'
import type { CourseWithLevels } from '@/app/server/institutoActions'

type CourseDrawerProps = {
  open: boolean
  onClose: () => void
  course: CourseWithLevels | null
  onRefresh: () => void
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const GRADED_COMPONENTS = [
  { key: 'test', label: 'Test', weight: 0.4 },
  { key: 'lectura', label: 'Lectura de libro', weight: 0.35 },
  { key: 'asistencia', label: 'Asistencia', weight: 0.15 },
  { key: 'participacion', label: 'Participación', weight: 0.1 }
]

const CourseDrawer = ({ open, onClose, course, onRefresh }: CourseDrawerProps) => {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [evaluationType, setEvaluationType] = useState<'graded' | 'pass_fail'>('graded')
  const [passingGrade, setPassingGrade] = useState(70)
  const [maxAbsences, setMaxAbsences] = useState(1)
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const isEditing = !!course

  useEffect(() => {
    if (course) {
      setName(course.name)
      setSlug(course.slug)
      setDescription(course.description || '')
      setEvaluationType(course.evaluationType as 'graded' | 'pass_fail')
      setIsActive(course.isActive)
      setSlugManuallyEdited(true)

      const config = course.evaluationConfig as Record<string, unknown> | null

      if (config) {
        if (course.evaluationType === 'graded' && typeof config.passingGrade === 'number') {
          setPassingGrade(config.passingGrade)
        }

        if (
          course.evaluationType === 'pass_fail' &&
          typeof config.maxAbsencesPerLevel === 'number'
        ) {
          setMaxAbsences(config.maxAbsencesPerLevel)
        }
      }
    } else {
      setName('')
      setSlug('')
      setDescription('')
      setEvaluationType('graded')
      setPassingGrade(70)
      setMaxAbsences(1)
      setIsActive(true)
      setSlugManuallyEdited(false)
    }

    setError(null)
  }, [course, open])

  const handleNameChange = (value: string) => {
    setName(value)

    if (!slugManuallyEdited && !isEditing) {
      setSlug(generateSlug(value))
    }
  }

  const handleSlugChange = (value: string) => {
    setSlug(value)
    setSlugManuallyEdited(true)
  }

  const buildEvaluationConfig = () => {
    if (evaluationType === 'graded') {
      return {
        type: 'weighted',
        passingGrade,
        components: GRADED_COMPONENTS
      }
    }

    return {
      type: 'attendance_threshold',
      maxAbsencesPerLevel: maxAbsences,
      failOnExceed: 'course'
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('El nombre es requerido')

      return
    }

    if (!slug.trim()) {
      setError('El slug es requerido')

      return
    }

    setSaving(true)
    setError(null)

    try {
      const evaluationConfig = buildEvaluationConfig()

      if (isEditing) {
        await updateCourse(course.id, {
          name: name.trim(),
          description: description.trim() || null,
          evaluationType,
          evaluationConfig,
          isActive
        })
      } else {
        await createCourse({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || undefined,
          evaluationType,
          evaluationConfig
        })
      }

      onRefresh()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}>
      <Box className='flex flex-col h-full'>
        <Box className='flex justify-between items-center p-4 border-b'>
          <Typography variant='h6'>{isEditing ? 'Editar Curso' : 'Nuevo Curso'}</Typography>
          <IconButton onClick={onClose}>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        <Box className='flex-1 overflow-y-auto p-4'>
          <Box className='flex flex-col gap-4'>
            {error && (
              <Alert severity='error' onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <TextField
              label='Nombre del Curso'
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              fullWidth
              required
              error={!name.trim() && !!error}
            />

            <TextField
              label='Slug'
              value={slug}
              onChange={e => handleSlugChange(e.target.value)}
              fullWidth
              required
              error={!slug.trim() && !!error}
              helperText='Identificador único en URL (ej: vida-cristiana)'
              disabled={isEditing}
            />

            <TextField
              label='Descripción'
              value={description}
              onChange={e => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder='Describe el contenido de este curso...'
            />

            <Divider />

            <Typography variant='subtitle2' className='font-semibold'>
              Tipo de evaluación
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Tipo de evaluación</InputLabel>
              <Select
                value={evaluationType}
                onChange={e => setEvaluationType(e.target.value as 'graded' | 'pass_fail')}
                label='Tipo de evaluación'
              >
                <MenuItem value='graded'>Con calificaciones y notas</MenuItem>
                <MenuItem value='pass_fail'>Solo asistencia</MenuItem>
              </Select>
            </FormControl>

            {evaluationType === 'graded' && (
              <Box className='flex flex-col gap-3'>
                <TextField
                  label='Nota mínima para aprobar'
                  type='number'
                  value={passingGrade}
                  onChange={e => setPassingGrade(Number(e.target.value))}
                  fullWidth
                  inputProps={{ min: 0, max: 100 }}
                  helperText='Calificación mínima requerida (0-100)'
                />
                <Typography variant='subtitle2' color='text.secondary'>
                  Componentes de evaluación (predeterminados)
                </Typography>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Componente</TableCell>
                      <TableCell align='right'>Peso</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {GRADED_COMPONENTS.map(c => (
                      <TableRow key={c.key}>
                        <TableCell>{c.label}</TableCell>
                        <TableCell align='right'>{Math.round(c.weight * 100)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}

            {evaluationType === 'pass_fail' && (
              <TextField
                label='Máximo de ausencias por nivel'
                type='number'
                value={maxAbsences}
                onChange={e => setMaxAbsences(Number(e.target.value))}
                fullWidth
                inputProps={{ min: 0, max: 20 }}
                helperText='El estudiante reprueba al superar este número de ausencias'
              />
            )}

            {isEditing && (
              <>
                <Divider />
                <FormControlLabel
                  control={<Switch checked={isActive} onChange={e => setIsActive(e.target.checked)} />}
                  label={isActive ? 'Curso Activo' : 'Curso Inactivo'}
                />
              </>
            )}
          </Box>
        </Box>

        <Box className='flex gap-3 p-4 border-t'>
          <Button variant='contained' onClick={handleSubmit} disabled={saving} fullWidth>
            {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Curso'}
          </Button>
          <Button variant='outlined' onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default CourseDrawer
