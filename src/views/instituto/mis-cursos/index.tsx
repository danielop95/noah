'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import CardActions from '@mui/material/CardActions'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Avatar from '@mui/material/Avatar'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import CircularProgress from '@mui/material/CircularProgress'

import { withdrawEnrollment } from '@/app/server/institutoActions'
import type { EnrollmentWithDetails, CourseWithLevels } from '@/app/server/institutoActions'

type Props = {
  myEnrollments: EnrollmentWithDetails[]
  courses: CourseWithLevels[]
  userId: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Activo',
  active: 'Activo',
  completed: 'Completado',
  failed: 'Reprobado',
  rejected: 'Rechazado',
  withdrawn: 'Retirado'
}

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error' | 'default' | 'info'> = {
  pending: 'warning',
  approved: 'success',
  active: 'success',
  completed: 'info',
  failed: 'error',
  rejected: 'error',
  withdrawn: 'default'
}

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

const MisCursosView = ({ myEnrollments, courses }: Props) => {
  const router = useRouter()
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  // Partition enrollments
  const activeEnrollment = myEnrollments.find(e => e.status === 'active' || e.status === 'approved')
  const pendingEnrollment = !activeEnrollment
    ? myEnrollments.find(e => e.status === 'pending')
    : undefined
  const historyEnrollments = myEnrollments.filter(
    e => e.status === 'completed' || e.status === 'failed' || e.status === 'rejected' || e.status === 'withdrawn'
  )

  const hasActiveOrPending = !!(activeEnrollment || pendingEnrollment)

  const handleWithdraw = async (enrollmentId: string) => {
    setWithdrawLoading(true)
    setWithdrawError(null)
    setWithdrawSuccess(false)

    try {
      await withdrawEnrollment(enrollmentId)
      setWithdrawSuccess(true)
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al retirar la solicitud'
      setWithdrawError(msg)
    } finally {
      setWithdrawLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <Typography variant='h5'>Mis Cursos</Typography>
        <Typography variant='body2' color='text.secondary'>
          Tu progreso en el Instituto Life
        </Typography>
      </div>

      {withdrawError && (
        <Alert severity='error' onClose={() => setWithdrawError(null)}>
          {withdrawError}
        </Alert>
      )}
      {withdrawSuccess && (
        <Alert severity='success' onClose={() => setWithdrawSuccess(false)}>
          Solicitud retirada exitosamente.
        </Alert>
      )}

      {/* Curso activo */}
      {activeEnrollment && (
        <Card
          sx={{
            border: theme => `1px solid ${theme.palette.success.main}`,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{ bgcolor: 'success.main', px: 3, py: 1.5 }}
            className='flex items-center gap-2'
          >
            <i className='solar-book-2-linear' style={{ color: 'white', fontSize: 20 }} />
            <Typography variant='subtitle2' sx={{ color: 'white', fontWeight: 600 }}>
              Mi curso actual
            </Typography>
          </Box>
          <CardContent>
            <Grid container spacing={4} alignItems='center'>
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography variant='h6' gutterBottom>
                  {activeEnrollment.cohort.level.course.name}
                </Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Nivel: <strong>{activeEnrollment.cohort.level.name}</strong>
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Cohorte: {activeEnrollment.cohort.name || 'Sin nombre asignado'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box className='flex items-center justify-between mb-1'>
                    <Typography variant='caption' color='text.secondary'>
                      Progreso del curso
                    </Typography>
                    <Chip
                      label={STATUS_LABELS[activeEnrollment.status] || activeEnrollment.status}
                      color={STATUS_COLORS[activeEnrollment.status] || 'default'}
                      size='small'
                      variant='tonal'
                    />
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant='caption' color='text.disabled' sx={{ mt: 0.5, display: 'block' }}>
                    Inscrito el {formatDate(activeEnrollment.enrolledAt)}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Box className='flex flex-col gap-2 items-start md:items-end'>
                  <Button
                    variant='contained'
                    color='success'
                    size='small'
                    href='/dashboard/instituto'
                    startIcon={<i className='solar-arrow-right-linear' />}
                  >
                    Ver detalle
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Solicitud pendiente */}
      {pendingEnrollment && (
        <Card
          sx={{
            border: theme => `1px solid ${theme.palette.warning.main}`,
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{ bgcolor: 'warning.main', px: 3, py: 1.5 }}
            className='flex items-center gap-2'
          >
            <i className='solar-clock-circle-linear' style={{ color: 'white', fontSize: 20 }} />
            <Typography variant='subtitle2' sx={{ color: 'white', fontWeight: 600 }}>
              Solicitud en revisión
            </Typography>
          </Box>
          <CardContent>
            <Grid container spacing={4} alignItems='center'>
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant='h6' gutterBottom>
                  {pendingEnrollment.cohort.level.course.name}
                </Typography>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Nivel: <strong>{pendingEnrollment.cohort.level.name}</strong>
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Tu solicitud está siendo revisada por el coordinador. Te notificaremos cuando sea
                  procesada.
                </Typography>
                <Typography variant='caption' color='text.disabled' sx={{ mt: 1, display: 'block' }}>
                  Solicitado el {formatDate(pendingEnrollment.enrolledAt)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box className='flex justify-start md:justify-end'>
                  <Button
                    variant='outlined'
                    color='warning'
                    size='small'
                    disabled={withdrawLoading}
                    onClick={() => handleWithdraw(pendingEnrollment.id)}
                    startIcon={
                      withdrawLoading ? (
                        <CircularProgress size={14} />
                      ) : (
                        <i className='solar-trash-bin-trash-linear' />
                      )
                    }
                  >
                    {withdrawLoading ? 'Retirando...' : 'Retirar solicitud'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Catálogo de cursos disponibles (solo si no hay activo ni pendiente) */}
      {!hasActiveOrPending && (
        <div>
          <Box className='flex items-center justify-between mb-4'>
            <div>
              <Typography variant='h6'>Cursos disponibles</Typography>
              <Typography variant='body2' color='text.secondary'>
                Explora el catálogo del Instituto Life. Para inscribirte, busca una cohorte
                disponible.
              </Typography>
            </div>
            <Button
              variant='outlined'
              size='small'
              href='/dashboard/instituto/cohortes'
              startIcon={<i className='solar-calendar-search-linear' />}
            >
              Ver cohortes
            </Button>
          </Box>

          {courses.length === 0 ? (
            <Alert severity='info'>No hay cursos disponibles en este momento.</Alert>
          ) : (
            <Grid container spacing={4}>
              {courses
                .filter(c => c.isActive)
                .map(course => (
                  <Grid key={course.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {course.imageUrl && (
                        <Box
                          component='img'
                          src={course.imageUrl}
                          alt={course.name}
                          sx={{ width: '100%', height: 140, objectFit: 'cover' }}
                        />
                      )}
                      {!course.imageUrl && (
                        <Box
                          sx={{
                            height: 100,
                            bgcolor: 'primary.lighter',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <i
                            className='solar-book-bookmark-linear'
                            style={{ fontSize: 48, opacity: 0.5 }}
                          />
                        </Box>
                      )}
                      <CardHeader
                        title={course.name}
                        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
                        subheader={
                          <Chip
                            label={course.evaluationType === 'graded' ? 'Calificado' : 'Aprobado/Reprobado'}
                            size='small'
                            color={course.evaluationType === 'graded' ? 'primary' : 'secondary'}
                            variant='tonal'
                            sx={{ mt: 0.5 }}
                          />
                        }
                        sx={{ pb: 1 }}
                      />
                      <CardContent sx={{ pt: 0, flexGrow: 1 }}>
                        {course.description && (
                          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                            {course.description}
                          </Typography>
                        )}
                        <Divider sx={{ mb: 1.5 }} />
                        <Typography variant='caption' color='text.secondary' fontWeight={600}>
                          Niveles ({course.levels.length})
                        </Typography>
                        <Box className='flex flex-col gap-1 mt-1'>
                          {course.levels
                            .sort((a, b) => a.sortOrder - b.sortOrder)
                            .map(level => (
                              <Box key={level.id} className='flex items-center justify-between'>
                                <Typography variant='caption' color='text.secondary'>
                                  {level.name}
                                </Typography>
                                <Chip
                                  label={`${level._count.cohorts} cohorte${level._count.cohorts !== 1 ? 's' : ''}`}
                                  size='small'
                                  variant='outlined'
                                  sx={{ fontSize: 10, height: 20 }}
                                />
                              </Box>
                            ))}
                        </Box>
                      </CardContent>
                      <CardActions sx={{ pt: 0 }}>
                        <Button
                          size='small'
                          href='/dashboard/instituto/cohortes'
                          startIcon={<i className='solar-arrow-right-linear' />}
                          fullWidth
                          variant='tonal'
                        >
                          Ver cohortes disponibles
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
            </Grid>
          )}
        </div>
      )}

      {/* Historial */}
      {historyEnrollments.length > 0 && (
        <div>
          <Typography variant='h6' gutterBottom>
            Historial
          </Typography>
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Curso</TableCell>
                  <TableCell>Nivel</TableCell>
                  <TableCell>Nota final</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historyEnrollments.map(enrollment => (
                  <TableRow key={enrollment.id} hover>
                    <TableCell>
                      <Typography variant='body2' fontWeight={500}>
                        {enrollment.cohort.level.course.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{enrollment.cohort.level.name}</Typography>
                    </TableCell>
                    <TableCell>
                      {enrollment.finalGrade !== null ? (
                        <Typography variant='body2' fontWeight={600}>
                          {enrollment.finalGrade}
                        </Typography>
                      ) : (
                        <Typography variant='body2' color='text.disabled'>
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={STATUS_LABELS[enrollment.status] || enrollment.status}
                        color={STATUS_COLORS[enrollment.status] || 'default'}
                        size='small'
                        variant='tonal'
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {enrollment.completedAt
                          ? formatDate(enrollment.completedAt)
                          : formatDate(enrollment.enrolledAt)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Empty state — nada en absoluto */}
      {myEnrollments.length === 0 && !hasActiveOrPending && courses.filter(c => c.isActive).length === 0 && (
        <Box className='flex flex-col items-center justify-center gap-4 py-16'>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.lighter' }}>
            <i className='solar-graduation-cap-linear' style={{ fontSize: 40 }} />
          </Avatar>
          <div className='text-center'>
            <Typography variant='h6'>Aún no tienes cursos</Typography>
            <Typography variant='body2' color='text.secondary'>
              Explora el catálogo de cohortes disponibles para inscribirte en el Instituto Life.
            </Typography>
          </div>
          <Button
            variant='contained'
            href='/dashboard/instituto/cohortes'
            startIcon={<i className='solar-arrow-right-linear' />}
          >
            Explorar cohortes
          </Button>
        </Box>
      )}
    </div>
  )
}

export default MisCursosView
