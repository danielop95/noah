'use client'

// React Imports
import { forwardRef } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
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
  const { anchorEl, selectedDate, events, calendarsColor, isAdmin, onClose, onEventClick, onAddEvent } = props

  const theme = useTheme()
  const open = Boolean(anchorEl) && selectedDate !== null

  // Filtrar eventos del día seleccionado
  const dayEvents = events.filter(event => {
    if (!selectedDate || !event.start) return false

    const eventStart = new Date(event.start as Date)
    const eventEnd = event.end ? new Date(event.end as Date) : eventStart

    const selectedDay = new Date(selectedDate)
    selectedDay.setHours(0, 0, 0, 0)

    const eventStartDay = new Date(eventStart)
    eventStartDay.setHours(0, 0, 0, 0)

    const eventEndDay = new Date(eventEnd)
    eventEndDay.setHours(0, 0, 0, 0)

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
            width: 380,
            maxWidth: '92vw',
            maxHeight: '75vh',
            borderRadius: '10px',
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.25)',
            border: 'none',
            overflow: 'hidden'
          }
        }
      }}
    >
      {/* Header con fecha */}
      <Box
        sx={{
          background: `linear-gradient(145deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`,
          color: 'white',
          px: 3,
          py: 2.5,
          position: 'relative'
        }}
      >
        <IconButton
          size='small'
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'rgba(255,255,255,0.7)',
            '&:hover': {
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
        >
          <i className='ri-close-line text-xl' />
        </IconButton>

        <Typography
          variant='h6'
          sx={{
            fontWeight: 700,
            textTransform: 'capitalize',
            letterSpacing: '-0.02em',
            fontSize: '1.125rem'
          }}
        >
          {formatDateHeader(selectedDate)}
        </Typography>
        <Typography
          variant='body2'
          sx={{
            color: 'rgba(255,255,255,0.7)',
            mt: 0.5,
            fontWeight: 500
          }}
        >
          {dayEvents.length === 0
            ? 'Sin actividades programadas'
            : `${dayEvents.length} ${dayEvents.length === 1 ? 'actividad' : 'actividades'}`}
        </Typography>
      </Box>

      {/* Lista de eventos */}
      <Box
        sx={{
          maxHeight: 320,
          overflowY: 'auto',
          backgroundColor: theme.palette.grey[50]
        }}
      >
        {dayEvents.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center', backgroundColor: 'white' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5
              }}
            >
              <i className='ri-calendar-check-line text-4xl' style={{ color: theme.palette.primary.main }} />
            </Box>
            <Typography variant='body1' color='text.secondary' sx={{ fontWeight: 500 }}>
              No hay eventos para este día
            </Typography>
            {isAdmin && (
              <Button
                variant='contained'
                size='medium'
                startIcon={<i className='ri-add-line' />}
                onClick={onAddEvent}
                sx={{ mt: 3, px: 4 }}
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
              const darkColor = theme.palette[colorName].dark

              return (
                <Box
                  key={event.id || index}
                  onClick={() => onEventClick(event)}
                  sx={{
                    mb: index < dayEvents.length - 1 ? 1.5 : 0,
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    borderRadius: '10px',
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha(color, 0.2)}`,
                      borderColor: alpha(color, 0.3),
                      '& .event-arrow': {
                        transform: 'translateX(4px)',
                        color: color
                      }
                    }
                  }}
                >
                  {/* Barra de color superior */}
                  <Box
                    sx={{
                      height: 4,
                      background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`
                    }}
                  />

                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      {/* Icono de categoría */}
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: '10px',
                          backgroundColor: alpha(color, 0.12),
                          border: `1px solid ${alpha(color, 0.2)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <i className={categoryIcons[category]} style={{ color: darkColor, fontSize: 20 }} />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Título */}
                        <Typography
                          variant='subtitle1'
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            lineHeight: 1.3,
                            mb: 0.5,
                            color: theme.palette.grey[900],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {event.title}
                        </Typography>

                        {/* Info row */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          {/* Hora */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              color: theme.palette.text.secondary
                            }}
                          >
                            <i className='ri-time-line' style={{ fontSize: 14 }} />
                            <Typography variant='caption' sx={{ fontWeight: 500 }}>
                              {event.allDay ? 'Todo el día' : formatTime(event.start as Date)}
                            </Typography>
                          </Box>

                          {/* Categoría chip */}
                          <Chip
                            label={categoryLabels[category]}
                            size='small'
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              backgroundColor: alpha(color, 0.12),
                              color: darkColor,
                              border: `1px solid ${alpha(color, 0.2)}`,
                              '& .MuiChip-label': {
                                px: 1.5
                              }
                            }}
                          />
                        </Box>

                        {/* Ubicación */}
                        {event.extendedProps?.location && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mt: 1,
                              color: theme.palette.text.secondary
                            }}
                          >
                            <i className='ri-map-pin-line' style={{ fontSize: 14 }} />
                            <Typography variant='caption' sx={{ fontWeight: 500 }}>
                              {event.extendedProps.location}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Flecha */}
                      <Box
                        className='event-arrow'
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: theme.palette.text.disabled,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <i className='ri-arrow-right-s-line text-xl' />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>

      {/* Footer con botón agregar (solo admin) */}
      {isAdmin && dayEvents.length > 0 && (
        <Box
          sx={{
            p: 2.5,
            backgroundColor: 'white',
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Button
            fullWidth
            variant='contained'
            color='primary'
            startIcon={<i className='ri-add-line' />}
            onClick={onAddEvent}
            sx={{
              py: 1.25,
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
              }
            }}
          >
            Agregar actividad
          </Button>
        </Box>
      )}
    </Popover>
  )
})

DayEventsPopover.displayName = 'DayEventsPopover'

export default DayEventsPopover
