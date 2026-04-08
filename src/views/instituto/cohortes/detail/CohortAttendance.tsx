'use client'

import { useState, useMemo } from 'react'

import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

import { markAttendance } from '@/app/server/institutoActions'

type Session = {
  id: string
  sessionNumber: number
  scheduledDate: Date
  status: string
}

type StudentAttendance = {
  enrollmentId: string
  userId: string
  name: string
  attendance: { sessionId: string; present: boolean }[]
}

type AttendanceData = {
  sessions: Session[]
  students: StudentAttendance[]
}

type Props = {
  attendanceData: AttendanceData
}

type AttendanceState = Record<string, Record<string, boolean>> // enrollmentId -> sessionId -> present

const formatDate = (date: Date | string) => {
  const d = new Date(date)

  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })
}

const CohortAttendance = ({ attendanceData }: Props) => {
  const { sessions, students } = attendanceData

  // Initialize state from data
  const [attendance, setAttendance] = useState<AttendanceState>(() => {
    const state: AttendanceState = {}

    students.forEach(student => {
      state[student.enrollmentId] = {}
      student.attendance.forEach(a => {
        state[student.enrollmentId][a.sessionId] = a.present
      })
    })

    return state
  })

  const [saving, setSaving] = useState<string | null>(null) // sessionId being saved
  const [savedSessions, setSavedSessions] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleToggle = (enrollmentId: string, sessionId: string) => {
    setAttendance(prev => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [sessionId]: !prev[enrollmentId]?.[sessionId]
      }
    }))
    // Mark session as modified (clear saved status)
    setSavedSessions(prev => {
      const next = new Set(prev)

      next.delete(sessionId)

      return next
    })
  }

  const handleSaveSession = async (sessionId: string) => {
    setSaving(sessionId)
    setErrors(prev => ({ ...prev, [sessionId]: '' }))

    try {
      const records = students.map(student => ({
        enrollmentId: student.enrollmentId,
        present: attendance[student.enrollmentId]?.[sessionId] ?? false
      }))

      await markAttendance(sessionId, records)
      setSavedSessions(prev => new Set([...prev, sessionId]))
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        [sessionId]: err instanceof Error ? err.message : 'Error al guardar'
      }))
    } finally {
      setSaving(null)
    }
  }

  // Calculate attendance percentage per student
  const studentPercentages = useMemo(() => {
    const completedSessions = sessions.filter(s => s.status === 'completed')

    return students.map(student => {
      if (completedSessions.length === 0) return { enrollmentId: student.enrollmentId, pct: null }
      const presentCount = completedSessions.filter(
        s => attendance[student.enrollmentId]?.[s.id] === true
      ).length
      const pct = Math.round((presentCount / completedSessions.length) * 100)

      return { enrollmentId: student.enrollmentId, pct }
    })
  }, [sessions, students, attendance])

  if (sessions.length === 0) {
    return (
      <Box className='flex flex-col items-center gap-2 py-12'>
        <i className='solar-calendar-linear text-5xl text-textSecondary' />
        <Typography variant='body1' className='text-textSecondary'>
          No hay sesiones generadas para esta cohorte
        </Typography>
      </Box>
    )
  }

  if (students.length === 0) {
    return (
      <Box className='flex flex-col items-center gap-2 py-12'>
        <i className='solar-users-group-rounded-linear text-5xl text-textSecondary' />
        <Typography variant='body1' className='text-textSecondary'>
          No hay estudiantes activos en esta cohorte
        </Typography>
      </Box>
    )
  }

  return (
    <Box className='flex flex-col gap-3'>
      <Typography variant='body2' color='text.secondary'>
        Marca la asistencia por sesion y guarda columna por columna. Las celdas en rojo indican ausencia.
      </Typography>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size='small' sx={{ minWidth: sessions.length * 80 + 200 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 160, position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}>
                Estudiante
              </TableCell>
              {sessions.map(session => (
                <TableCell key={session.id} align='center' sx={{ minWidth: 80 }}>
                  <Box className='flex flex-col items-center gap-1'>
                    <Typography variant='caption' className='font-semibold'>
                      S{session.sessionNumber}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.65rem' }}>
                      {formatDate(session.scheduledDate)}
                    </Typography>
                    {session.status === 'completed' && (
                      <i className='solar-check-circle-linear text-success text-xs' />
                    )}
                  </Box>
                </TableCell>
              ))}
              <TableCell align='center' sx={{ minWidth: 70 }}>
                % Asist.
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map(student => {
              const pctObj = studentPercentages.find(p => p.enrollmentId === student.enrollmentId)
              const pct = pctObj?.pct

              return (
                <TableRow key={student.enrollmentId} hover>
                  <TableCell
                    sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 1 }}
                  >
                    <Typography variant='body2' noWrap sx={{ maxWidth: 150 }}>
                      {student.name}
                    </Typography>
                  </TableCell>
                  {sessions.map(session => {
                    const present = attendance[student.enrollmentId]?.[session.id] ?? false

                    return (
                      <TableCell key={session.id} align='center' sx={{ p: 0.5 }}>
                        <Tooltip title={present ? 'Presente' : 'Ausente'}>
                          <Checkbox
                            checked={present}
                            onChange={() => handleToggle(student.enrollmentId, session.id)}
                            size='small'
                            color='success'
                            icon={<i className='solar-close-circle-linear text-error' />}
                            checkedIcon={<i className='solar-check-circle-linear text-success' />}
                          />
                        </Tooltip>
                      </TableCell>
                    )
                  })}
                  <TableCell align='center'>
                    {pct === null ? (
                      <Typography variant='caption' color='text.secondary'>-</Typography>
                    ) : (
                      <Chip
                        label={`${pct}%`}
                        size='small'
                        color={pct < 70 ? 'error' : pct < 80 ? 'warning' : 'success'}
                        variant='tonal'
                      />
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Save buttons per session */}
      <Box className='flex flex-wrap gap-2 pt-2'>
        {sessions.map(session => (
          <Box key={session.id} className='flex flex-col items-center gap-1'>
            {errors[session.id] && (
              <Alert severity='error' sx={{ py: 0, px: 1, fontSize: '0.7rem' }}>
                {errors[session.id]}
              </Alert>
            )}
            <Button
              size='small'
              variant={savedSessions.has(session.id) ? 'outlined' : 'contained'}
              color={savedSessions.has(session.id) ? 'success' : 'primary'}
              onClick={() => handleSaveSession(session.id)}
              disabled={saving === session.id}
              startIcon={
                saving === session.id ? (
                  <CircularProgress size={12} />
                ) : savedSessions.has(session.id) ? (
                  <i className='solar-check-circle-linear' />
                ) : undefined
              }
              sx={{ minWidth: 100 }}
            >
              {saving === session.id
                ? 'Guardando...'
                : savedSessions.has(session.id)
                  ? `S${session.sessionNumber} ✓`
                  : `Guardar S${session.sessionNumber}`}
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default CohortAttendance
