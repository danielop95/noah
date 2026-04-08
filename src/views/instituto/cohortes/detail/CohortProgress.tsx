'use client'

import { useMemo } from 'react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import LinearProgress from '@mui/material/LinearProgress'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

import type { EnrollmentWithDetails } from '@/app/server/institutoActions'

type AttendanceData = {
  sessions: { id: string; sessionNumber: number; scheduledDate: Date; status: string }[]
  students: {
    enrollmentId: string
    userId: string
    name: string
    attendance: { sessionId: string; present: boolean }[]
  }[]
}

type Props = {
  enrollments: EnrollmentWithDetails[]
  attendanceData: AttendanceData
}

const getUserName = (user: EnrollmentWithDetails['user']) => {
  if (user.name) return user.name

  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Usuario'
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()

const SummaryCard = ({
  label,
  count,
  icon,
  color
}: {
  label: string
  count: number
  icon: string
  color: 'success' | 'error' | 'warning' | 'info' | 'default'
}) => (
  <Card variant='outlined'>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Box className='flex items-center gap-3'>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}.lighter`,
            color: `${color}.main`
          }}
        >
          <i className={`${icon} text-xl`} />
        </Box>
        <Box>
          <Typography variant='h5' className='font-bold'>
            {count}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            {label}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
)

const CohortProgress = ({ enrollments, attendanceData }: Props) => {
  const { sessions, students: attendanceStudents } = attendanceData
  const completedSessions = sessions.filter(s => s.status === 'completed')

  // Map enrollmentId -> attendance percentage
  const attendanceMap = useMemo(() => {
    const map: Record<string, number> = {}

    attendanceStudents.forEach(student => {
      if (completedSessions.length === 0) {
        map[student.enrollmentId] = 0

        return
      }

      const presentCount = completedSessions.filter(
        s => student.attendance.some(a => a.sessionId === s.id && a.present)
      ).length

      map[student.enrollmentId] = Math.round((presentCount / completedSessions.length) * 100)
    })

    return map
  }, [attendanceStudents, completedSessions])

  // Compute summary counts
  const summary = useMemo(() => {
    const activeEnrollments = enrollments.filter(e => ['approved', 'active', 'completed', 'failed'].includes(e.status))

    const approved = activeEnrollments.filter(e => e.status === 'completed' && e.passed === true).length
    const completed = activeEnrollments.filter(e => e.status === 'completed').length
    const pending = enrollments.filter(e => e.status === 'pending').length
    const atRisk = activeEnrollments.filter(e => {
      const pct = attendanceMap[e.id]

      return pct !== undefined && pct < 70 && e.status !== 'completed'
    }).length

    return { approved, completed, atRisk, pending }
  }, [enrollments, attendanceMap])

  const activeStudents = useMemo(() => {
    return enrollments
      .filter(e => ['approved', 'active'].includes(e.status))
      .map(e => ({
        enrollment: e,
        name: getUserName(e.user),
        pct: attendanceMap[e.id] ?? null
      }))
      .sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0))
  }, [enrollments, attendanceMap])

  return (
    <Box className='flex flex-col gap-4'>
      {/* Summary cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <SummaryCard label='Aprobados' count={summary.approved} icon='solar-diploma-linear' color='success' />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <SummaryCard label='Completados' count={summary.completed} icon='solar-check-circle-linear' color='info' />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <SummaryCard label='En riesgo (< 70%)' count={summary.atRisk} icon='solar-danger-triangle-linear' color='error' />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <SummaryCard label='Pendientes' count={summary.pending} icon='solar-clock-circle-linear' color='warning' />
        </Grid>
      </Grid>

      {/* Attendance risk alert */}
      {summary.atRisk > 0 && (
        <Alert severity='warning' icon={<i className='solar-danger-triangle-linear' />}>
          <strong>{summary.atRisk} estudiante{summary.atRisk !== 1 ? 's' : ''}</strong> tiene
          {summary.atRisk !== 1 ? 'n' : ''} menos del 70% de asistencia y {summary.atRisk !== 1 ? 'estan' : 'esta'} en
          riesgo de perder el curso.
        </Alert>
      )}

      {/* Student progress list */}
      {activeStudents.length === 0 ? (
        <Box className='flex flex-col items-center gap-2 py-8'>
          <i className='solar-graph-up-linear text-4xl text-textSecondary' />
          <Typography variant='body2' className='text-textSecondary'>
            No hay estudiantes activos para mostrar progreso
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant='subtitle2' className='font-semibold'>
            Progreso de asistencia por estudiante
          </Typography>
          <Card variant='outlined'>
            <List disablePadding>
              {activeStudents.map(({ enrollment, name, pct }, index) => {
                const isAtRisk = pct !== null && pct < 70
                const isWarning = pct !== null && pct >= 70 && pct < 80

                return (
                  <Box key={enrollment.id}>
                    {index > 0 && <Divider component='li' />}
                    <ListItem
                      secondaryAction={
                        <Box className='flex items-center gap-2'>
                          {isAtRisk && (
                            <Chip
                              label='En riesgo'
                              size='small'
                              color='error'
                              variant='tonal'
                              icon={<i className='solar-danger-triangle-linear' />}
                            />
                          )}
                          {isWarning && !isAtRisk && (
                            <Chip
                              label='Atencion'
                              size='small'
                              color='warning'
                              variant='tonal'
                            />
                          )}
                          <Typography variant='body2' className='font-semibold' sx={{ minWidth: 40, textAlign: 'right' }}>
                            {pct !== null ? `${pct}%` : '-'}
                          </Typography>
                        </Box>
                      }
                      sx={{ pr: 18 }}
                    >
                      <ListItemAvatar>
                        <Avatar src={enrollment.user.image || undefined} sx={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                          {getInitials(name)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant='body2' className='font-medium'>
                            {name}
                          </Typography>
                        }
                        secondary={
                          pct !== null ? (
                            <Box className='flex items-center gap-2 mt-1' sx={{ maxWidth: 200 }}>
                              <LinearProgress
                                variant='determinate'
                                value={Math.min(pct, 100)}
                                color={isAtRisk ? 'error' : isWarning ? 'warning' : 'success'}
                                sx={{ flex: 1, height: 6, borderRadius: 1 }}
                              />
                            </Box>
                          ) : (
                            <Typography variant='caption' color='text.secondary'>Sin sesiones completadas</Typography>
                          )
                        }
                      />
                    </ListItem>
                  </Box>
                )
              })}
            </List>
          </Card>
        </>
      )}
    </Box>
  )
}

export default CohortProgress
