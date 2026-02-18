'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import { alpha, useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { CalendarCategory, CalendarSelectedEvent } from './types'

const categoryLabels: Record<CalendarCategory, string> = {
  culto: 'Culto',
  evento: 'Evento Especial',
  reunion: 'Reunión de Líderes',
  actividad: 'Actividad de Red',
  capacitacion: 'Capacitación'
}

const categoryIcons: Record<CalendarCategory, string> = {
  culto: 'ri-service-line',
  evento: 'ri-star-line',
  reunion: 'ri-team-line',
  actividad: 'ri-run-line',
  capacitacion: 'ri-graduation-cap-line'
}

const categoryColors: Record<CalendarCategory, 'primary' | 'warning' | 'error' | 'success' | 'info'> = {
  culto: 'primary',
  evento: 'warning',
  reunion: 'error',
  actividad: 'success',
  capacitacion: 'info'
}

type Props = {
  open: boolean
  event: CalendarSelectedEvent
  onClose: () => void
  onEdit?: () => void
  isAdmin?: boolean
}

const EventDetailDialog = ({ open, event, onClose, onEdit, isAdmin = false }: Props) => {
  const theme = useTheme()
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  if (!event) return null

  const colorName = categoryColors[event.category]
  const color = theme.palette[colorName].main

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isSameDay = (date1: Date, date2: Date) => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)

    return (
      d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '10px',
          overflow: 'hidden'
        }
      }}
    >
      {/* Header con gradiente */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.8)} 100%)`,
          color: 'white',
          p: 4,
          pb: 6,
          position: 'relative'
        }}
      >
        {/* Botón cerrar */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'white',
            backgroundColor: alpha('#fff', 0.1),
            '&:hover': { backgroundColor: alpha('#fff', 0.2) }
          }}
        >
          <i className='ri-close-line text-xl' />
        </IconButton>

        {/* Icono de categoría */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '10px',
            backgroundColor: alpha('#fff', 0.2),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2
          }}
        >
          <i className={categoryIcons[event.category]} style={{ fontSize: 28 }} />
        </Box>

        {/* Categoría chip */}
        <Chip
          label={categoryLabels[event.category]}
          size='small'
          sx={{
            backgroundColor: alpha('#fff', 0.2),
            color: 'white',
            fontWeight: 500,
            mb: 1.5
          }}
        />

        {/* Título */}
        <Typography variant='h4' sx={{ fontWeight: 700, lineHeight: 1.2, color: 'white' }}>
          {event.title}
        </Typography>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Info cards */}
        <Box sx={{ p: 3 }}>
          {/* Fecha y Hora */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            {/* Fecha */}
            <Box
              sx={{
                flex: 1,
                minWidth: 200,
                p: 2,
                borderRadius: '10px',
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: alpha(theme.palette.primary.main, 0.15)
                  }}
                >
                  <i className='ri-calendar-line text-xl' style={{ color: theme.palette.primary.main }} />
                </Avatar>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Fecha
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                    {formatDate(event.start)}
                    {!isSameDay(event.start, event.end) && (
                      <>
                        <br />
                        <span style={{ fontWeight: 400 }}>hasta {formatDate(event.end)}</span>
                      </>
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Hora */}
            <Box
              sx={{
                flex: 1,
                minWidth: 150,
                p: 2,
                borderRadius: '10px',
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: alpha(theme.palette.info.main, 0.15)
                  }}
                >
                  <i className='ri-time-line text-xl' style={{ color: theme.palette.info.main }} />
                </Avatar>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Horario
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {event.allDay ? 'Todo el día' : `${formatTime(event.start)} - ${formatTime(event.end)}`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Ubicación */}
          {event.location && (
            <Box
              sx={{
                p: 2,
                mb: 3,
                borderRadius: '10px',
                backgroundColor: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: alpha(theme.palette.success.main, 0.15)
                  }}
                >
                  <i className='ri-map-pin-line text-xl' style={{ color: theme.palette.success.main }} />
                </Avatar>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Ubicación
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {event.location}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Descripción */}
          {event.description && (
            <Box sx={{ mb: 3 }}>
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className='ri-file-text-line' />
                Descripción
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  color: 'text.primary',
                  lineHeight: 1.7,
                  p: 2,
                  borderRadius: '10px',
                  backgroundColor: alpha(theme.palette.grey[500], 0.05)
                }}
              >
                {event.description}
              </Typography>
            </Box>
          )}

          {/* URL */}
          {event.url && (
            <Box sx={{ mb: 3 }}>
              <Button
                variant='outlined'
                fullWidth
                href={event.url}
                target='_blank'
                rel='noopener noreferrer'
                startIcon={<i className='ri-external-link-line' />}
                sx={{
                  borderStyle: 'dashed',
                  py: 1.5
                }}
              >
                Ver más información
              </Button>
            </Box>
          )}

          {/* Botones de acción */}
          <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
            <Button variant='outlined' fullWidth onClick={onClose}>
              Cerrar
            </Button>
            {isAdmin && onEdit && (
              <Button
                variant='contained'
                fullWidth
                startIcon={<i className='ri-edit-line' />}
                onClick={onEdit}
              >
                Editar
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default EventDetailDialog
