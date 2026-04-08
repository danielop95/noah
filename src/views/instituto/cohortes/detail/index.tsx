'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'

import CohortStudents from './CohortStudents'
import CohortAttendance from './CohortAttendance'
import CohortGrades from './CohortGrades'
import CohortProgress from './CohortProgress'
import type { CohortWithDetails, EnrollmentWithDetails } from '@/app/server/institutoActions'

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
  cohort: CohortWithDetails & { sessions?: unknown[] }
  enrollments: EnrollmentWithDetails[]
  attendanceData: AttendanceData
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

const getTeacherName = (teacher: CohortWithDetails['teacher']) => {
  if (teacher.name) return teacher.name

  return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Sin maestro'
}

const getCohortTitle = (cohort: CohortWithDetails) => {
  if (cohort.name) return cohort.name

  return `${cohort.level.course.name} — ${cohort.level.name}`
}

const CohortDetailView = ({ cohort, enrollments, attendanceData }: Props) => {
  const router = useRouter()
  const [tab, setTab] = useState('students')

  const teacherName = getTeacherName(cohort.teacher)
  const title = getCohortTitle(cohort)
  const isGraded = cohort.level.course.evaluationType === 'graded' || cohort.level.course.evaluationType === 'weighted'

  return (
    <div className='flex flex-col gap-6'>
      {/* Header card */}
      <Card>
        <CardContent>
          <Box className='flex items-center gap-3 mb-4'>
            <IconButton onClick={() => router.back()} size='small'>
              <i className='solar-arrow-left-linear' />
            </IconButton>
            <Box className='flex-1'>
              <Box className='flex items-center gap-2 flex-wrap'>
                <Typography variant='h5'>{title}</Typography>
                <Chip
                  label={STATUS_LABELS[cohort.status] || cohort.status}
                  size='small'
                  color={STATUS_COLORS[cohort.status] || 'default'}
                  variant='tonal'
                />
              </Box>
              <Typography variant='body2' color='text.secondary'>
                {cohort.level.course.name} — {cohort.level.name}
              </Typography>
            </Box>
          </Box>
          <Divider className='mb-4' />
          <Box className='flex flex-wrap gap-6'>
            <Box className='flex items-center gap-2'>
              <i className='solar-clock-circle-linear text-textSecondary' />
              <Typography variant='body2'>
                {DAYS_LABELS[cohort.weekDay] || cohort.weekDay} {cohort.startTime}
              </Typography>
            </Box>
            <Box className='flex items-center gap-2'>
              <i className='solar-users-group-two-rounded-linear text-textSecondary' />
              <Typography variant='body2'>
                {cohort._count.enrollments}/{cohort.maxCapacity} inscritos
              </Typography>
            </Box>
            <Box className='flex items-center gap-2'>
              <Avatar src={cohort.teacher.image || undefined} sx={{ width: 24, height: 24, fontSize: '0.6rem' }}>
                {teacherName.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant='body2'>{teacherName}</Typography>
            </Box>
            <Box className='flex items-center gap-2'>
              <i className='solar-calendar-linear text-textSecondary' />
              <Typography variant='body2'>
                {cohort._count.sessions} sesiones programadas
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <TabList onChange={(_, v) => setTab(v)}>
              <Tab
                label='Estudiantes'
                value='students'
                icon={<i className='solar-users-group-rounded-linear' />}
                iconPosition='start'
              />
              <Tab
                label='Asistencia'
                value='attendance'
                icon={<i className='solar-check-circle-linear' />}
                iconPosition='start'
              />
              {isGraded && (
                <Tab
                  label='Calificaciones'
                  value='grades'
                  icon={<i className='solar-diploma-linear' />}
                  iconPosition='start'
                />
              )}
              <Tab
                label='Avance'
                value='progress'
                icon={<i className='solar-graph-up-linear' />}
                iconPosition='start'
              />
            </TabList>
          </Box>

          <TabPanel value='students' sx={{ p: 0 }}>
            <CohortStudents enrollments={enrollments} />
          </TabPanel>

          <TabPanel value='attendance' sx={{ p: 2 }}>
            <CohortAttendance attendanceData={attendanceData} />
          </TabPanel>

          {isGraded && (
            <TabPanel value='grades' sx={{ p: 2 }}>
              <CohortGrades cohortId={cohort.id} evaluationConfig={cohort.level.course.evaluationConfig} />
            </TabPanel>
          )}

          <TabPanel value='progress' sx={{ p: 2 }}>
            <CohortProgress enrollments={enrollments} attendanceData={attendanceData} />
          </TabPanel>
        </TabContext>
      </Card>
    </div>
  )
}

export default CohortDetailView
