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
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Autocomplete from '@mui/material/Autocomplete'

import { createCohort, updateCohort, getTeacherUsers } from '@/app/server/institutoActions'
import type { CohortWithDetails, CourseWithLevels } from '@/app/server/institutoActions'

const DAYS_OF_WEEK = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miercoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sabado' },
  { value: 'domingo', label: 'Domingo' }
]

type TeacherUser = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  image: string | null
}

const getTeacherDisplayName = (user: TeacherUser) => {
  if (user.name) return user.name

  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario'
}

const getInitials = (user: TeacherUser) => {
  const name = getTeacherDisplayName(user)

  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

type CohortDrawerProps = {
  open: boolean
  onClose: () => void
  cohort: CohortWithDetails | null
  courses: CourseWithLevels[]
  onRefresh: () => void
}

const toDateString = (date: Date | string | undefined | null): string => {
  if (!date) return ''
  const d = new Date(date)

  return d.toISOString().split('T')[0]
}

const CohortDrawer = ({ open, onClose, cohort, courses, onRefresh }: CohortDrawerProps) => {
  const [courseId, setCourseId] = useState<string>('')
  const [levelId, setLevelId] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [teacher, setTeacher] = useState<TeacherUser | null>(null)
  const [weekDay, setWeekDay] = useState<string>('')
  const [startTime, setStartTime] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [maxCapacity, setMaxCapacity] = useState<number>(20)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teachers, setTeachers] = useState<TeacherUser[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)

  const isEditing = !!cohort

  const selectedCourse = courses.find(c => c.id === courseId) ?? null
  const availableLevels = selectedCourse?.levels.filter(l => l.isActive) ?? []
  const selectedLevel = availableLevels.find(l => l.id === levelId) ?? null

  // Load teachers once on open
  useEffect(() => {
    if (!open) return
    setLoadingTeachers(true)
    getTeacherUsers()
      .then(setTeachers)
      .catch(() => setTeachers([]))
      .finally(() => setLoadingTeachers(false))
  }, [open])

  // Reset / populate form when cohort changes
  useEffect(() => {
    if (cohort) {
      setCourseId(cohort.level.course.id)
      setLevelId(cohort.level.id)
      setName(cohort.name || '')
      setTeacher({
        id: cohort.teacher.id,
        name: cohort.teacher.name,
        firstName: cohort.teacher.firstName,
        lastName: cohort.teacher.lastName,
        image: cohort.teacher.image
      })
      setWeekDay(cohort.weekDay)
      setStartTime(cohort.startTime)
      setStartDate(toDateString(cohort.startDate))
      setEndDate(toDateString(cohort.endDate))
      setMaxCapacity(cohort.maxCapacity)
    } else {
      setCourseId('')
      setLevelId('')
      setName('')
      setTeacher(null)
      setWeekDay('')
      setStartTime('')
      setStartDate('')
      setEndDate('')
      setMaxCapacity(20)
    }

    setError(null)
  }, [cohort, open])

  // When course changes, reset level (unless editing, keep level if same course)
  const handleCourseChange = (newCourseId: string) => {
    setCourseId(newCourseId)
    setLevelId('')
  }

  const handleSubmit = async () => {
    if (!levelId) { setError('Debes seleccionar un nivel'); return }
    if (!teacher) { setError('Debes seleccionar un maestro'); return }
    if (!weekDay) { setError('Debes seleccionar un dia de la semana'); return }
    if (!startTime) { setError('Debes indicar la hora de inicio'); return }
    if (!startDate) { setError('Debes indicar la fecha de inicio'); return }
    if (!endDate) { setError('Debes indicar la fecha de fin'); return }
    if (maxCapacity < 1) { setError('El cupo maximo debe ser al menos 1'); return }

    setSaving(true)
    setError(null)

    try {
      if (isEditing) {
        await updateCohort(cohort.id, {
          name: name.trim() || undefined,
          teacherId: teacher.id,
          weekDay,
          startTime,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          maxCapacity
        })
      } else {
        await createCohort({
          levelId,
          courseId,
          teacherId: teacher.id,
          name: name.trim() || undefined,
          weekDay,
          startTime,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          maxCapacity
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
    <Drawer anchor='right' open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 500 } } }}>
      <Box className='flex flex-col h-full'>
        <Box className='flex justify-between items-center p-4 border-b'>
          <Typography variant='h6'>{isEditing ? 'Editar Cohorte' : 'Nueva Cohorte'}</Typography>
          <IconButton onClick={onClose}>
            <i className='solar-close-circle-linear' />
          </IconButton>
        </Box>

        <Box className='flex-1 overflow-y-auto p-4'>
          <Box className='flex flex-col gap-4'>
            {error && (
              <Alert severity='error' onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Curso */}
            <Typography variant='subtitle2' className='font-semibold'>
              Curso y Nivel
            </Typography>
            <FormControl fullWidth required disabled={isEditing}>
              <InputLabel>Curso</InputLabel>
              <Select value={courseId} onChange={e => handleCourseChange(e.target.value)} label='Curso'>
                {courses.filter(c => c.isActive).map(course => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Nivel */}
            <FormControl fullWidth required disabled={isEditing || !courseId}>
              <InputLabel>Nivel</InputLabel>
              <Select
                value={levelId}
                onChange={e => setLevelId(e.target.value)}
                label='Nivel'
              >
                {availableLevels.map(level => (
                  <MenuItem key={level.id} value={level.id}>
                    {level.name} ({level.sessionCount} sesiones)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider className='my-1' />

            {/* Nombre opcional */}
            <TextField
              label='Nombre de la cohorte (opcional)'
              value={name}
              onChange={e => setName(e.target.value)}
              fullWidth
              placeholder={
                selectedCourse && selectedLevel
                  ? `${selectedCourse.name} — ${selectedLevel.name} — Enero 2026`
                  : 'ADL Nivel 1 — Enero 2026'
              }
              helperText='Si no se indica, se usara el nombre del curso y nivel'
            />

            <Divider className='my-1' />

            {/* Maestro */}
            <Typography variant='subtitle2' className='font-semibold'>
              Maestro
            </Typography>
            {loadingTeachers ? (
              <Box className='flex items-center gap-2'>
                <CircularProgress size={20} />
                <Typography variant='body2'>Cargando maestros...</Typography>
              </Box>
            ) : (
              <Autocomplete
                options={teachers}
                value={teacher}
                onChange={(_, newValue) => setTeacher(newValue)}
                getOptionLabel={getTeacherDisplayName}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={params => (
                  <TextField
                    {...params}
                    label='Seleccionar maestro'
                    placeholder='Buscar maestro...'
                    error={!teacher && !!error}
                  />
                )}
                renderOption={(props, option) => (
                  <Box
                    component='li'
                    {...props}
                    key={option.id}
                    sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, px: 2 }}
                  >
                    <Avatar src={option.image || undefined} sx={{ width: 36, height: 36, flexShrink: 0 }}>
                      {getInitials(option)}
                    </Avatar>
                    <Typography variant='body2'>{getTeacherDisplayName(option)}</Typography>
                  </Box>
                )}
              />
            )}

            <Divider className='my-1' />

            {/* Horario */}
            <Typography variant='subtitle2' className='font-semibold'>
              Horario
            </Typography>
            <Box className='flex gap-3'>
              <FormControl fullWidth required>
                <InputLabel>Dia</InputLabel>
                <Select value={weekDay} onChange={e => setWeekDay(e.target.value)} label='Dia'>
                  <MenuItem value=''>Sin definir</MenuItem>
                  {DAYS_OF_WEEK.map(day => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label='Hora inicio'
                type='time'
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Divider className='my-1' />

            {/* Fechas */}
            <Typography variant='subtitle2' className='font-semibold'>
              Período
            </Typography>
            <Box className='flex gap-3'>
              <TextField
                label='Fecha inicio'
                type='date'
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label='Fecha fin'
                type='date'
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Divider className='my-1' />

            {/* Cupo */}
            <Typography variant='subtitle2' className='font-semibold'>
              Cupo
            </Typography>
            <TextField
              label='Cupo maximo'
              type='number'
              value={maxCapacity}
              onChange={e => setMaxCapacity(Math.max(1, parseInt(e.target.value) || 1))}
              fullWidth
              required
              inputProps={{ min: 1 }}
              helperText={selectedLevel ? `El nivel tiene ${selectedLevel.sessionCount} sesiones programadas` : undefined}
            />
          </Box>
        </Box>

        <Box className='flex gap-3 p-4 border-t'>
          <Button variant='contained' onClick={handleSubmit} disabled={saving} fullWidth>
            {saving ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Cohorte'}
          </Button>
          <Button variant='outlined' onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default CohortDrawer
