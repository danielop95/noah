'use client'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

type Props = {
  stats: {
    totalCourses: number
    activeCohorts: number
    totalEnrollments: number
    approvedEnrollments: number
    completedEnrollments: number
    failedEnrollments: number
    totalStudents: number
    upcomingCohorts: {
      id: string
      name: string | null
      weekDay: string
      startTime: string
      startDate: Date
      level: { name: string; course: { name: string } }
      teacher: { name: string | null; firstName: string | null; lastName: string | null }
    }[]
  }
}

const InstitutoDashboard = ({ stats }: Props) => {
  const approvalRate =
    stats.completedEnrollments > 0
      ? Math.round(((stats.completedEnrollments - stats.failedEnrollments) / stats.completedEnrollments) * 100)
      : 0

  const statCards = [
    { label: 'Estudiantes', value: stats.totalStudents, icon: 'solar-users-group-rounded-linear', color: '#4CAF50' },
    { label: 'Inscritos', value: stats.totalEnrollments, icon: 'solar-clipboard-list-linear', color: '#2196F3' },
    { label: 'Cohortes activas', value: stats.activeCohorts, icon: 'solar-calendar-linear', color: '#FF9800' },
    { label: 'Tasa de aprobación', value: `${approvalRate}%`, icon: 'solar-diploma-linear', color: '#9C27B0' }
  ]

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <Typography variant='h5'>Instituto Life</Typography>
        <Typography variant='body2' color='text.secondary'>
          Panel de seguimiento académico
        </Typography>
      </div>

      <Grid container spacing={4}>
        {statCards.map(card => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box className='flex items-center justify-between mb-2'>
                  <Typography variant='body2' color='text.secondary'>
                    {card.label}
                  </Typography>
                  <Box sx={{ bgcolor: card.color + '20', borderRadius: 2, p: 1 }}>
                    <i className={`${card.icon} text-xl`} style={{ color: card.color }} />
                  </Box>
                </Box>
                <Typography variant='h4' sx={{ color: card.color }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {stats.upcomingCohorts.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant='h6' className='mb-4'>
              Próximas cohortes
            </Typography>
            <div className='flex flex-col gap-3'>
              {stats.upcomingCohorts.map(cohort => {
                const teacherName = (
                  cohort.teacher.name ||
                  `${cohort.teacher.firstName || ''} ${cohort.teacher.lastName || ''}`.trim()
                )

                return (
                  <Box
                    key={cohort.id}
                    className='flex items-center justify-between p-3 rounded-lg'
                    sx={{ bgcolor: 'action.hover' }}
                  >
                    <Box>
                      <Typography variant='body2' className='font-medium'>
                        {cohort.name || `${cohort.level.course.name} — ${cohort.level.name}`}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {cohort.weekDay} {cohort.startTime} · {teacherName}
                      </Typography>
                    </Box>
                    <Chip
                      label={new Date(cohort.startDate).toLocaleDateString('es-CO')}
                      size='small'
                    />
                  </Box>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default InstitutoDashboard
