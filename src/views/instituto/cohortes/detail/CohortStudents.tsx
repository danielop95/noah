'use client'

import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'

import type { EnrollmentWithDetails } from '@/app/server/institutoActions'

type Props = {
  enrollments: EnrollmentWithDetails[]
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  active: 'Activo',
  completed: 'Completado',
  failed: 'Reprobado',
  rejected: 'Rechazado',
  withdrawn: 'Retirado'
}

const STATUS_COLORS: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
  pending: 'warning',
  approved: 'info',
  active: 'success',
  completed: 'success',
  failed: 'error',
  rejected: 'default',
  withdrawn: 'default'
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

const formatDate = (date: Date | string) => {
  const d = new Date(date)

  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const CohortStudents = ({ enrollments }: Props) => {
  if (enrollments.length === 0) {
    return (
      <Box className='flex flex-col items-center gap-2 py-12 px-4'>
        <i className='solar-users-group-rounded-linear text-5xl text-textSecondary' />
        <Typography variant='body1' className='text-textSecondary'>
          No hay estudiantes inscritos en esta cohorte
        </Typography>
      </Box>
    )
  }

  return (
    <List disablePadding>
      {enrollments.map((enrollment, index) => {
        const userName = getUserName(enrollment.user)

        return (
          <Box key={enrollment.id}>
            {index > 0 && <Divider component='li' />}
            <ListItem
              secondaryAction={
                <Box className='flex flex-col items-end gap-1'>
                  <Chip
                    label={STATUS_LABELS[enrollment.status] || enrollment.status}
                    size='small'
                    color={STATUS_COLORS[enrollment.status] || 'default'}
                    variant='tonal'
                  />
                  <Typography variant='caption' color='text.secondary'>
                    {formatDate(enrollment.enrolledAt)}
                  </Typography>
                </Box>
              }
              sx={{ pr: 16 }}
            >
              <ListItemAvatar>
                <Avatar src={enrollment.user.image || undefined}>
                  {getInitials(userName)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant='body2' className='font-medium'>
                    {userName}
                  </Typography>
                }
                secondary={
                  <Typography variant='caption' color='text.secondary'>
                    {enrollment.user.email || ''}
                  </Typography>
                }
              />
            </ListItem>
          </Box>
        )
      })}
    </List>
  )
}

export default CohortStudents
