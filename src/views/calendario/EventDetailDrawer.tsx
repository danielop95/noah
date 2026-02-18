'use client'

// MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { CalendarCategory, CalendarSelectedEvent } from './types'

const categoryLabels: Record<CalendarCategory, string> = {
  culto: 'Culto',
  evento: 'Evento Especial',
  reunion: 'Reunión de Líderes',
  actividad: 'Actividad de Red',
  capacitacion: 'Capacitación'
}

const categoryColors: Record<CalendarCategory, 'primary' | 'warning' | 'error' | 'success' | 'info'> = {
  culto: 'primary',
  evento: 'warning',
  reunion: 'error',
  actividad: 'success',
  capacitacion: 'info'
}

type Props = {
  drawerOpen: boolean
  selectedEvent: CalendarSelectedEvent
  handleDrawerToggle: () => void
}

const EventDetailDrawer = (props: Props) => {
  const { drawerOpen, selectedEvent, handleDrawerToggle } = props

  // Hooks
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  if (!selectedEvent) return null

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

  const ScrollWrapper = isBelowSmScreen ? 'div' : PerfectScrollbar

  return (
    <Drawer
      anchor='right'
      open={drawerOpen}
      onClose={handleDrawerToggle}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', 400] } }}
    >
      <Box className='flex justify-between items-center sidebar-header pli-5 plb-4 border-be'>
        <Typography variant='h5'>Detalles del Evento</Typography>
        <IconButton size='small' onClick={handleDrawerToggle}>
          <i className='ri-close-line text-2xl' />
        </IconButton>
      </Box>
      <ScrollWrapper
        {...(isBelowSmScreen
          ? { className: 'bs-full overflow-y-auto overflow-x-hidden' }
          : { options: { wheelPropagation: false, suppressScrollX: true } })}
      >
        <Box className='sidebar-body p-6'>
          {/* Categoría */}
          <Chip
            label={categoryLabels[selectedEvent.category]}
            color={categoryColors[selectedEvent.category]}
            size='small'
            variant='tonal'
            className='mbe-4'
          />

          {/* Título */}
          <Typography variant='h4' className='mbe-4'>
            {selectedEvent.title}
          </Typography>

          <Divider className='mbe-4' />

          {/* Fecha y Hora */}
          <div className='flex flex-col gap-4 mbe-4'>
            <div className='flex items-center gap-3'>
              <div className='flex items-center justify-center p-2 rounded bg-actionHover'>
                <i className='ri-calendar-line text-xl text-primary' />
              </div>
              <div>
                <Typography variant='body2' color='text.secondary'>
                  Fecha
                </Typography>
                <Typography variant='body1' className='capitalize'>
                  {formatDate(selectedEvent.start)}
                </Typography>
              </div>
            </div>

            {!selectedEvent.allDay && (
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center p-2 rounded bg-actionHover'>
                  <i className='ri-time-line text-xl text-info' />
                </div>
                <div>
                  <Typography variant='body2' color='text.secondary'>
                    Horario
                  </Typography>
                  <Typography variant='body1'>
                    {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
                  </Typography>
                </div>
              </div>
            )}

            {selectedEvent.allDay && (
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center p-2 rounded bg-actionHover'>
                  <i className='ri-time-line text-xl text-info' />
                </div>
                <div>
                  <Typography variant='body2' color='text.secondary'>
                    Horario
                  </Typography>
                  <Typography variant='body1'>
                    Todo el día
                  </Typography>
                </div>
              </div>
            )}

            {selectedEvent.location && (
              <div className='flex items-center gap-3'>
                <div className='flex items-center justify-center p-2 rounded bg-actionHover'>
                  <i className='ri-map-pin-line text-xl text-success' />
                </div>
                <div>
                  <Typography variant='body2' color='text.secondary'>
                    Ubicación
                  </Typography>
                  <Typography variant='body1'>
                    {selectedEvent.location}
                  </Typography>
                </div>
              </div>
            )}
          </div>

          {/* Descripción */}
          {selectedEvent.description && (
            <>
              <Divider className='mbe-4' />
              <Typography variant='subtitle2' color='text.secondary' className='mbe-2'>
                Descripción
              </Typography>
              <Typography variant='body1' className='mbe-4'>
                {selectedEvent.description}
              </Typography>
            </>
          )}

          {/* URL */}
          {selectedEvent.url && (
            <>
              <Divider className='mbe-4' />
              <Typography variant='subtitle2' color='text.secondary' className='mbe-2'>
                Más información
              </Typography>
              <a
                href={selectedEvent.url}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 text-primary no-underline hover:underline'
              >
                <i className='ri-external-link-line' />
                <Typography variant='body2' color='primary'>
                  {selectedEvent.url}
                </Typography>
              </a>
            </>
          )}
        </Box>
      </ScrollWrapper>
    </Drawer>
  )
}

export default EventDetailDrawer
