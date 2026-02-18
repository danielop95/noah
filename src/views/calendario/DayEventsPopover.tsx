'use client'

// React Imports
import { forwardRef } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Popover from '@mui/material/Popover'
import { alpha, useTheme } from '@mui/material/styles'

// Type Imports
import type { CalendarCategory, CalendarColors } from './types'
import type { EventInput } from '@fullcalendar/core'

const categoryLabels: Record<CalendarCategory, string> = {
  culto: 'Culto',
  evento: 'Evento',
  reunion: 'Reunión',
  actividad: 'Actividad',
  capacitacion: 'Capacitación'
}

const categoryIcons: Record<CalendarCategory, string> = {
  culto: 'ri-service-line',
  evento: 'ri-star-line',
  reunion: 'ri-team-line',
  actividad: 'ri-run-line',
  capacitacion: 'ri-graduation-cap-line'
}

type Props = {
  anchorEl: HTMLElement | null
  selectedDate: Date | null
  events: EventInput[]
  calendarsColor: CalendarColors
  isAdmin: boolean
  onClose: () => void
  onEventClick: (event: EventInput) => void
  onAddEvent: () => void
}

const DayEventsPopover = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {
    anchorEl,
    selectedDate,
    events,
    calendarsColor,
    isAdmin,
    onClose,
    onEventClick,
    onAddEvent
  } = props

  const theme = useTheme()
  const open = Boolean(anchorEl) && selectedDate !== null

  // Filtrar eventos del día seleccionado
  const dayEvents = events.filter(event => {
    if (!selectedDate || !event.start) return false

    const eventStart = new Date(event.start as Date)
    const eventEnd = event.end ? new Date(event.end as Date) : eventStart

    // Normalizar fechas a medianoche para comparación
    const selectedDay = new Date(selectedDate)
    selectedDay.setHours(0, 0, 0, 0)

    const eventStartDay = new Date(eventStart)
    eventStartDay.setHours(0, 0, 0, 0)

    const eventEndDay = new Date(eventEnd)
    eventEndDay.setHours(0, 0, 0, 0)

    // El evento incluye este día si:
    // - Empieza este día, O
    // - Es un evento multi-día y este día está dentro del rango
    return selectedDay >= eventStartDay && selectedDay <= eventEndDay
  })

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateHeader = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  if (!selectedDate) return null

  return (
    <Popover
      ref={ref}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left'
      }}
      slotProps={{
        paper: {
          sx: {
            width: 360,
            maxWidth: '90vw',
            maxHeight: '70vh',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            overflow: 'hidden'
          }
        }
      }}
    >
      {/* Header con fecha */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          p: 3,
          position: 'relative'
        }}
      >
        <IconButton
          size='small'
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            '&:hover': { backgroundColor: alpha('#fff', 0.2) }
          }}
        >
          <i className='ri-close-line text-lg' />
        </IconButton>

        <Typography variant='h6' sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
          {formatDateHeader(selectedDate)}
        </Typography>
        <Typography variant='body2' sx={{ opacity: 0.9, mt: 0.5 }}>
          {dayEvents.length === 0
            ? 'Sin actividades programadas'
            : `${dayEvents.length} ${dayEvents.length === 1 ? 'actividad' : 'actividades'}`}
        </Typography>
      </Box>

      {/* Lista de eventos */}
      <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
        {dayEvents.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <i className='ri-calendar-check-line text-3xl' style={{ color: theme.palette.primary.main }} />
            </Box>
            <Typography variant='body1' color='text.secondary'>
              No hay eventos para este día
            </Typography>
            {isAdmin && (
              <Button
                variant='contained'
                size='small'
                startIcon={<i className='ri-add-line' />}
                onClick={onAddEvent}
                sx={{ mt: 2 }}
              >
                Crear evento
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {dayEvents.map((event, index) => {
              const category = event.extendedProps?.calendar as CalendarCategory
              const colorName = calendarsColor[category] || 'primary'
              const color = theme.palette[colorName].main

              return (
                <Card
                  key={event.id || index}
                  onClick={() => onEventClick(event)}
                  sx={{
                    mb: index < dayEvents.length - 1 ? 1.5 : 0,
                    cursor: 'pointer',
                    border: `1px solid ${alpha(color, 0.2)}`,
                    borderLeft: `4px solid ${color}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: `0 4px 12px ${alpha(color, 0.25)}`,
                      borderColor: alpha(color, 0.4)
                    }
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      {/* Icono de categoría */}
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          backgroundColor: alpha(color, 0.15),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <i className={categoryIcons[category]} style={{ color, fontSize: 18 }} />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Título */}
                        <Typography
                          variant='subtitle2'
                          sx={{
                            fontWeight: 600,
                            lineHeight: 1.3,
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {event.title}
                        </Typography>

                        {/* Hora y categoría */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography
                            variant='caption'
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              color: 'text.secondary'
                            }}
                          >
                            <i className='ri-time-line text-sm' />
                            {event.allDay ? 'Todo el día' : formatTime(event.start as Date)}
                          </Typography>

                          <Chip
                            label={categoryLabels[category]}
                            size='small'
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              backgroundColor: alpha(color, 0.15),
                              color: color,
                              fontWeight: 500
                            }}
                          />
                        </Box>

                        {/* Ubicación (si existe) */}
                        {event.extendedProps?.location && (
                          <Typography
                            variant='caption'
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              color: 'text.secondary',
                              mt: 0.5
                            }}
                          >
                            <i className='ri-map-pin-line text-sm' />
                            {event.extendedProps.location}
                          </Typography>
                        )}
                      </Box>

                      {/* Flecha */}
                      <i
                        className='ri-arrow-right-s-line text-xl'
                        style={{ color: theme.palette.text.disabled }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              )
            })}
          </Box>
        )}
      </Box>

      {/* Footer con botón agregar (solo admin) */}
      {isAdmin && dayEvents.length > 0 && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant='outlined'
              startIcon={<i className='ri-add-line' />}
              onClick={onAddEvent}
              sx={{ borderStyle: 'dashed' }}
            >
              Agregar actividad
            </Button>
          </Box>
        </>
      )}
    </Popover>
  )
})

DayEventsPopover.displayName = 'DayEventsPopover'

export default DayEventsPopover
