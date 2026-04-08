'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'

import { approveEnrollment, rejectEnrollment } from '@/app/server/institutoActions'
import type { EnrollmentWithDetails } from '@/app/server/institutoActions'

type Props = {
  pendingEnrollments: EnrollmentWithDetails[]
}

type DialogState = {
  open: boolean
  type: 'approve' | 'reject' | null
  enrollmentId: string | null
  studentName: string
  courseName: string
}

const InscripcionesView = ({ pendingEnrollments }: Props) => {
  const router = useRouter()
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>(pendingEnrollments)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    type: null,
    enrollmentId: null,
    studentName: '',
    courseName: ''
  })

  const openDialog = (
    type: 'approve' | 'reject',
    enrollment: EnrollmentWithDetails
  ) => {
    const studentName =
      enrollment.user.firstName && enrollment.user.lastName
        ? `${enrollment.user.firstName} ${enrollment.user.lastName}`
        : enrollment.user.name || enrollment.user.email || 'Estudiante'
    const courseName = `${enrollment.cohort.level.course.name} — ${enrollment.cohort.level.name}`

    setDialog({ open: true, type, enrollmentId: enrollment.id, studentName, courseName })
  }

  const closeDialog = () => {
    if (loading) return
    setDialog(prev => ({ ...prev, open: false }))
  }

  const handleConfirm = async () => {
    if (!dialog.enrollmentId || !dialog.type) return
    setLoading(true)
    setError(null)

    try {
      if (dialog.type === 'approve') {
        await approveEnrollment(dialog.enrollmentId)
      } else {
        await rejectEnrollment(dialog.enrollmentId)
      }

      // Optimistic: remove from local list
      setEnrollments(prev => prev.filter(e => e.id !== dialog.enrollmentId))
      setDialog(prev => ({ ...prev, open: false }))
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la solicitud'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (enrollment: EnrollmentWithDetails) => {
    const firstName = enrollment.user.firstName || ''
    const lastName = enrollment.user.lastName || ''
    if (firstName || lastName) return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
    const name = enrollment.user.name || enrollment.user.email || '?'
    return name[0].toUpperCase()
  }

  const getStudentName = (enrollment: EnrollmentWithDetails) => {
    if (enrollment.user.firstName && enrollment.user.lastName)
      return `${enrollment.user.firstName} ${enrollment.user.lastName}`
    return enrollment.user.name || enrollment.user.email || 'Sin nombre'
  }

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <Typography variant='h5'>Solicitudes de Inscripción</Typography>
        <Typography variant='body2' color='text.secondary'>
          Revisa y gestiona las solicitudes de inscripción pendientes
        </Typography>
      </div>

      {error && (
        <Alert severity='error' onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent className='p-0'>
          {enrollments.length === 0 ? (
            <Box
              className='flex flex-col items-center justify-center gap-4 py-16'
              sx={{ color: 'text.secondary' }}
            >
              <i className='solar-inbox-line-duotone' style={{ fontSize: 64, opacity: 0.4 }} />
              <div className='text-center'>
                <Typography variant='h6' color='text.secondary'>
                  Sin solicitudes pendientes
                </Typography>
                <Typography variant='body2' color='text.disabled'>
                  Cuando los estudiantes soliciten inscripción a una cohorte, aparecerán aquí
                </Typography>
              </div>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Estudiante</TableCell>
                  <TableCell>Curso / Nivel</TableCell>
                  <TableCell>Cohorte</TableCell>
                  <TableCell>Fecha solicitud</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align='right'>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.map(enrollment => (
                  <TableRow key={enrollment.id} hover>
                    <TableCell>
                      <Box className='flex items-center gap-3'>
                        <Avatar
                          src={enrollment.user.image || undefined}
                          sx={{ width: 36, height: 36, fontSize: 14 }}
                        >
                          {getInitials(enrollment)}
                        </Avatar>
                        <div>
                          <Typography variant='body2' fontWeight={500}>
                            {getStudentName(enrollment)}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {enrollment.user.email}
                          </Typography>
                        </div>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' fontWeight={500}>
                        {enrollment.cohort.level.course.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {enrollment.cohort.level.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>
                        {enrollment.cohort.name || 'Sin nombre'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{formatDate(enrollment.enrolledAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label='Pendiente' color='warning' size='small' variant='tonal' />
                    </TableCell>
                    <TableCell align='right'>
                      <Box className='flex items-center justify-end gap-2'>
                        <Button
                          size='small'
                          variant='contained'
                          color='success'
                          onClick={() => openDialog('approve', enrollment)}
                          startIcon={<i className='solar-check-circle-linear' />}
                        >
                          Aprobar
                        </Button>
                        <Button
                          size='small'
                          variant='outlined'
                          color='error'
                          onClick={() => openDialog('reject', enrollment)}
                          startIcon={<i className='solar-close-circle-linear' />}
                        >
                          Rechazar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialog.open} onClose={closeDialog} maxWidth='xs' fullWidth>
        <DialogTitle>
          {dialog.type === 'approve' ? 'Aprobar inscripción' : 'Rechazar inscripción'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialog.type === 'approve' ? (
              <>
                ¿Confirmas la aprobación de <strong>{dialog.studentName}</strong> en{' '}
                <strong>{dialog.courseName}</strong>? El estudiante quedará inscrito y activo en la
                cohorte.
              </>
            ) : (
              <>
                ¿Confirmas el rechazo de la solicitud de <strong>{dialog.studentName}</strong> en{' '}
                <strong>{dialog.courseName}</strong>? Esta acción notificará al estudiante.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            variant='contained'
            color={dialog.type === 'approve' ? 'success' : 'error'}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            {loading
              ? 'Procesando...'
              : dialog.type === 'approve'
                ? 'Confirmar aprobación'
                : 'Confirmar rechazo'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default InscripcionesView
