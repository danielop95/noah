'use client'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'

type Badge = {
  id: string
  badgeType: string
  courseId: string
  courseName: string
  levelId: string | null
  levelName: string | null
  earnedAt: Date
}

type Enrollment = {
  id: string
  status: string
  enrolledAt: Date
  completedAt: Date | null
  finalGrade: number | null
  passed: boolean | null
  cohort: {
    name: string | null
    weekDay: string
    startTime: string
    level: { name: string; course: { name: string } }
    teacher: { name: string | null; firstName: string | null; lastName: string | null }
  }
}

type Props = {
  tags: string[]
  activeEnrollment: Enrollment | null
  completedEnrollments: Enrollment[]
  badges: Badge[]
}

const TAG_LABELS: Record<string, { label: string; color: 'primary' | 'secondary' | 'success' | 'warning' | 'info' }> = {
  coordinador: { label: 'Coordinador', color: 'secondary' },
  maestro: { label: 'Maestro', color: 'primary' },
  estudiante: { label: 'Estudiante', color: 'info' }
}

const STATUS_LABELS: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' }> = {
  pending: { label: 'Pendiente', color: 'warning' },
  approved: { label: 'Aprobada', color: 'info' },
  active: { label: 'Activo', color: 'success' },
  completed: { label: 'Completado', color: 'success' },
  failed: { label: 'Reprobado', color: 'error' },
  rejected: { label: 'Rechazado', color: 'default' },
  withdrawn: { label: 'Retirado', color: 'default' }
}

const ProfileInstituto = ({ tags, activeEnrollment, completedEnrollments, badges }: Props) => {
  const hasActivity = tags.length > 0 || activeEnrollment || completedEnrollments.length > 0 || badges.length > 0

  if (!hasActivity) {
    return (
      <Card>
        <CardContent>
          <Box className='flex flex-col items-center justify-center py-12 gap-3'>
            <i className='solar-square-academic-cap-linear text-6xl text-textSecondary' />
            <Typography variant='body1' color='text.secondary'>
              Este usuario no tiene actividad en el Instituto Life
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Grid container spacing={4}>
      {/* Tags del instituto */}
      {tags.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Roles en el Instituto' />
            <CardContent>
              <Box className='flex gap-2 flex-wrap'>
                {tags.map(tag => {
                  const config = TAG_LABELS[tag] || { label: tag, color: 'default' as const }
                  return (
                    <Chip
                      key={tag}
                      icon={<i className='solar-square-academic-cap-linear' />}
                      label={config.label}
                      color={config.color}
                      variant='tonal'
                    />
                  )
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Curso activo */}
      {activeEnrollment && (
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardHeader
              title='Curso Actual'
              subheader={activeEnrollment.cohort.level.course.name}
            />
            <CardContent>
              <Box className='flex flex-col gap-3'>
                <Box className='flex items-center justify-between'>
                  <Typography variant='body2' className='font-medium'>
                    {activeEnrollment.cohort.level.name}
                  </Typography>
                  <Chip
                    label={STATUS_LABELS[activeEnrollment.status]?.label || activeEnrollment.status}
                    color={STATUS_LABELS[activeEnrollment.status]?.color || 'default'}
                    size='small'
                    variant='tonal'
                  />
                </Box>
                <Typography variant='caption' color='text.secondary'>
                  {activeEnrollment.cohort.weekDay} {activeEnrollment.cohort.startTime}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Maestro: {activeEnrollment.cohort.teacher.name || `${activeEnrollment.cohort.teacher.firstName || ''} ${activeEnrollment.cohort.teacher.lastName || ''}`.trim()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Badges */}
      {badges.length > 0 && (
        <Grid size={{ xs: 12, md: activeEnrollment ? 6 : 12 }}>
          <Card>
            <CardHeader title='Logros Obtenidos' />
            <CardContent>
              <Box className='flex flex-wrap gap-2'>
                {badges.map(badge => (
                  <Box
                    key={badge.id}
                    className='flex flex-col items-center gap-1 p-2 rounded-lg'
                    sx={{ bgcolor: 'action.hover', minWidth: 80, textAlign: 'center' }}
                  >
                    <Avatar sx={{ bgcolor: badge.badgeType === 'course_completed' ? 'success.main' : 'primary.main', width: 40, height: 40 }}>
                      <i className={badge.badgeType === 'course_completed' ? 'solar-diploma-linear' : 'solar-star-linear'} />
                    </Avatar>
                    <Typography variant='caption' className='font-medium' sx={{ fontSize: '0.65rem' }}>
                      {badge.levelName || badge.courseName}
                    </Typography>
                    <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.6rem' }}>
                      {new Date(badge.earnedAt).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Historial */}
      {completedEnrollments.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardHeader title='Historial Académico' />
            <CardContent>
              <Box className='flex flex-col gap-2'>
                {completedEnrollments.map(enrollment => (
                  <Box
                    key={enrollment.id}
                    className='flex items-center justify-between p-3 rounded-lg'
                    sx={{ bgcolor: 'action.hover' }}
                  >
                    <Box>
                      <Typography variant='body2' className='font-medium'>
                        {enrollment.cohort.level.course.name} — {enrollment.cohort.level.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString('es-CO') : ''}
                      </Typography>
                    </Box>
                    <Box className='flex items-center gap-2'>
                      {enrollment.finalGrade !== null && (
                        <Typography variant='body2' className='font-medium'>
                          {enrollment.finalGrade}
                        </Typography>
                      )}
                      <Chip
                        label={enrollment.passed ? 'Aprobado' : 'Reprobado'}
                        color={enrollment.passed ? 'success' : 'error'}
                        size='small'
                        variant='tonal'
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  )
}

export default ProfileInstituto
