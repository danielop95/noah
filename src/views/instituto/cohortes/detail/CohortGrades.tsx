'use client'

import { useState, useEffect, useMemo } from 'react'

import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Skeleton from '@mui/material/Skeleton'

import { getGradesByCohort, saveGrades, computeEnrollmentResult } from '@/app/server/institutoActions'

type EvaluationComponent = {
  component: string
  weight: number
  label?: string
}

type EvaluationConfig = {
  components?: EvaluationComponent[]
  passingGrade?: number
}

type StudentGrade = {
  enrollmentId: string
  userId: string
  name: string
  grades: { component: string; score: number }[]
  finalGrade: number | null
  passed: boolean | null
}

type Props = {
  cohortId: string
  evaluationConfig: unknown
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

const COMPONENT_LABELS: Record<string, string> = {
  test: 'Test',
  quiz: 'Quiz',
  reading: 'Lectura',
  attendance: 'Asistencia',
  participation: 'Participacion',
  assignment: 'Tarea',
  exam: 'Examen',
  project: 'Proyecto',
  oral: 'Oral'
}

const CohortGrades = ({ cohortId, evaluationConfig }: Props) => {
  const config = (evaluationConfig as EvaluationConfig) ?? {}
  const components = config.components ?? []
  const passingGrade = config.passingGrade ?? 60

  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Local editable state: enrollmentId -> component -> score string
  const [editValues, setEditValues] = useState<Record<string, Record<string, string>>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({})
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setLoading(true)
    getGradesByCohort(cohortId)
      .then(data => {
        setStudentGrades(data)
        // Initialize edit values from existing grades
        const initial: Record<string, Record<string, string>> = {}

        data.forEach(student => {
          initial[student.enrollmentId] = {}
          student.grades.forEach(g => {
            initial[student.enrollmentId][g.component] = String(g.score)
          })
        })
        setEditValues(initial)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Error al cargar calificaciones'))
      .finally(() => setLoading(false))
  }, [cohortId])

  const handleScoreChange = (enrollmentId: string, component: string, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [component]: value
      }
    }))
    setSavedIds(prev => {
      const next = new Set(prev)

      next.delete(enrollmentId)

      return next
    })
  }

  // Calculate live final grade
  const computeLiveFinal = (enrollmentId: string): number | null => {
    if (components.length === 0) return null
    let total = 0

    for (const comp of components) {
      const val = parseFloat(editValues[enrollmentId]?.[comp.component] ?? '0')

      total += (isNaN(val) ? 0 : val) * (comp.weight / 100)
    }

    return Math.round(total * 100) / 100
  }

  const handleSave = async (enrollmentId: string) => {
    setSavingId(enrollmentId)
    setSaveErrors(prev => ({ ...prev, [enrollmentId]: '' }))

    try {
      const grades = components.map(comp => ({
        component: comp.component,
        score: parseFloat(editValues[enrollmentId]?.[comp.component] ?? '0') || 0
      }))

      await saveGrades(enrollmentId, grades)
      await computeEnrollmentResult(enrollmentId)
      setSavedIds(prev => new Set([...prev, enrollmentId]))
    } catch (err) {
      setSaveErrors(prev => ({
        ...prev,
        [enrollmentId]: err instanceof Error ? err.message : 'Error al guardar'
      }))
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return (
      <Box className='flex flex-col gap-3'>
        {[1, 2, 3].map(i => <Skeleton key={i} variant='rectangular' height={48} />)}
      </Box>
    )
  }

  if (error) {
    return <Alert severity='error'>{error}</Alert>
  }

  if (components.length === 0) {
    return (
      <Alert severity='info'>
        Este curso no tiene componentes de evaluacion configurados. Configura el evaluationConfig del curso para habilitar
        calificaciones.
      </Alert>
    )
  }

  if (studentGrades.length === 0) {
    return (
      <Box className='flex flex-col items-center gap-2 py-12'>
        <i className='solar-diploma-linear text-5xl text-textSecondary' />
        <Typography variant='body1' className='text-textSecondary'>
          No hay estudiantes activos para calificar
        </Typography>
      </Box>
    )
  }

  return (
    <Box className='flex flex-col gap-3'>
      <Box className='flex items-center gap-2'>
        <Typography variant='body2' color='text.secondary'>
          Nota de aprobacion: <strong>{passingGrade}</strong>. La nota final se calcula en tiempo real con los pesos
          configurados.
        </Typography>
      </Box>

      <TableContainer>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 160 }}>Estudiante</TableCell>
              {components.map(comp => (
                <TableCell key={comp.component} align='center' sx={{ minWidth: 100 }}>
                  <Box className='flex flex-col items-center'>
                    <Typography variant='caption' className='font-semibold'>
                      {comp.label || COMPONENT_LABELS[comp.component] || comp.component}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>
                      {comp.weight}%
                    </Typography>
                  </Box>
                </TableCell>
              ))}
              <TableCell align='center' sx={{ minWidth: 80 }}>Nota Final</TableCell>
              <TableCell align='center' sx={{ minWidth: 80 }}>Estado</TableCell>
              <TableCell align='center' sx={{ minWidth: 120 }}>Accion</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {studentGrades.map(student => {
              const liveFinal = computeLiveFinal(student.enrollmentId)
              const isSaving = savingId === student.enrollmentId
              const isSaved = savedIds.has(student.enrollmentId)

              return (
                <TableRow key={student.enrollmentId} hover>
                  <TableCell>
                    <Box className='flex items-center gap-2'>
                      <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem' }}>
                        {getInitials(student.name)}
                      </Avatar>
                      <Typography variant='body2' noWrap sx={{ maxWidth: 130 }}>
                        {student.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  {components.map(comp => (
                    <TableCell key={comp.component} align='center'>
                      <TextField
                        size='small'
                        type='number'
                        value={editValues[student.enrollmentId]?.[comp.component] ?? ''}
                        onChange={e => handleScoreChange(student.enrollmentId, comp.component, e.target.value)}
                        inputProps={{ min: 0, max: 100, step: 0.5, style: { textAlign: 'center', width: 60, padding: '4px 6px' } }}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                  ))}
                  <TableCell align='center'>
                    <Typography
                      variant='body2'
                      className='font-semibold'
                      color={liveFinal !== null && liveFinal >= passingGrade ? 'success.main' : 'error.main'}
                    >
                      {liveFinal !== null ? liveFinal.toFixed(1) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    {liveFinal !== null ? (
                      <Chip
                        label={liveFinal >= passingGrade ? 'Aprueba' : 'Reprueba'}
                        size='small'
                        color={liveFinal >= passingGrade ? 'success' : 'error'}
                        variant='tonal'
                      />
                    ) : (
                      <Typography variant='caption' color='text.secondary'>-</Typography>
                    )}
                  </TableCell>
                  <TableCell align='center'>
                    <Box className='flex flex-col items-center gap-1'>
                      {saveErrors[student.enrollmentId] && (
                        <Typography variant='caption' color='error' sx={{ fontSize: '0.65rem' }}>
                          {saveErrors[student.enrollmentId]}
                        </Typography>
                      )}
                      <Button
                        size='small'
                        variant={isSaved ? 'outlined' : 'contained'}
                        color={isSaved ? 'success' : 'primary'}
                        onClick={() => handleSave(student.enrollmentId)}
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={12} /> : undefined}
                      >
                        {isSaving ? 'Guardando...' : isSaved ? 'Guardado' : 'Guardar'}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default CohortGrades
