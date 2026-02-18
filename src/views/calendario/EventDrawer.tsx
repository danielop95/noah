'use client'

// React Imports
import { useState, useEffect, forwardRef, useCallback } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import type { Theme } from '@mui/material/styles'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { CalendarCategory, CalendarSelectedEvent } from './types'

// Styled Component Imports
import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

// Server Actions
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/app/server/calendarActions'

interface PickerProps {
  label?: string
  error?: boolean
  registername?: string
}

interface DefaultStateType {
  url: string
  title: string
  allDay: boolean
  category: CalendarCategory
  description: string
  location: string
  endDate: Date
  startDate: Date
}

const defaultState: DefaultStateType = {
  url: '',
  title: '',
  allDay: true,
  description: '',
  location: '',
  endDate: new Date(),
  category: 'evento',
  startDate: new Date()
}

const categoryOptions: { value: CalendarCategory; label: string }[] = [
  { value: 'culto', label: 'Culto' },
  { value: 'evento', label: 'Evento Especial' },
  { value: 'reunion', label: 'Reunión de Líderes' },
  { value: 'actividad', label: 'Actividad de Red' },
  { value: 'capacitacion', label: 'Capacitación' }
]

type Props = {
  drawerOpen: boolean
  selectedEvent: CalendarSelectedEvent
  handleDrawerToggle: () => void
  onEventUpdated: () => void
}

const EventDrawer = (props: Props) => {
  const { drawerOpen, selectedEvent, handleDrawerToggle, onEventUpdated } = props

  // States
  const [values, setValues] = useState<DefaultStateType>(defaultState)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const PickersComponent = forwardRef(({ ...props }: PickerProps, ref) => {
    return (
      <TextField inputRef={ref} fullWidth {...props} label={props.label || ''} className='is-full' error={props.error} />
    )
  })

  // Hooks
  const isBelowSmScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

  const {
    control,
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm({ defaultValues: { title: '' } })

  const isNewEvent = !selectedEvent?.id

  const resetToStoredValues = useCallback(() => {
    if (selectedEvent) {
      setValue('title', selectedEvent.title || '')
      setValues({
        url: selectedEvent.url || '',
        title: selectedEvent.title || '',
        allDay: selectedEvent.allDay,
        description: selectedEvent.description || '',
        location: selectedEvent.location || '',
        category: selectedEvent.category || 'evento',
        endDate: selectedEvent.end ? new Date(selectedEvent.end) : new Date(),
        startDate: selectedEvent.start ? new Date(selectedEvent.start) : new Date()
      })
    }
  }, [setValue, selectedEvent])

  const resetToEmptyValues = useCallback(() => {
    setValue('title', '')
    setValues(defaultState)
  }, [setValue])

  const handleSidebarClose = () => {
    setValues(defaultState)
    clearErrors()
    handleDrawerToggle()
  }

  const onSubmit = async (data: { title: string }) => {
    setIsSubmitting(true)

    try {
      const eventData = {
        title: data.title,
        description: values.description || undefined,
        startDate: values.startDate,
        endDate: values.endDate,
        allDay: values.allDay,
        category: values.category,
        url: values.url || undefined,
        location: values.location || undefined
      }

      if (isNewEvent) {
        await createCalendarEvent(eventData)
      } else if (selectedEvent?.id) {
        await updateCalendarEvent(selectedEvent.id, eventData)
      }

      onEventUpdated()
      handleSidebarClose()
    } catch (error) {
      console.error('Error guardando evento:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteButtonClick = async () => {
    if (!selectedEvent?.id) return

    setIsSubmitting(true)

    try {
      await deleteCalendarEvent(selectedEvent.id)
      onEventUpdated()
      handleSidebarClose()
    } catch (error) {
      console.error('Error eliminando evento:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartDate = (date: Date | null) => {
    if (date && date > values.endDate) {
      setValues({ ...values, startDate: new Date(date), endDate: new Date(date) })
    }
  }

  const RenderSidebarFooter = () => {
    if (isNewEvent) {
      return (
        <div className='flex gap-4'>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Agregar'}
          </Button>
          <Button variant='outlined' color='secondary' onClick={resetToEmptyValues} disabled={isSubmitting}>
            Limpiar
          </Button>
        </div>
      )
    } else {
      return (
        <div className='flex gap-4'>
          <Button type='submit' variant='contained' disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Actualizar'}
          </Button>
          <Button variant='outlined' color='secondary' onClick={resetToStoredValues} disabled={isSubmitting}>
            Restaurar
          </Button>
        </div>
      )
    }
  }

  const ScrollWrapper = isBelowSmScreen ? 'div' : PerfectScrollbar

  useEffect(() => {
    if (selectedEvent) {
      resetToStoredValues()
    } else {
      resetToEmptyValues()
    }
  }, [drawerOpen, resetToStoredValues, resetToEmptyValues, selectedEvent])

  return (
    <Drawer
      anchor='right'
      open={drawerOpen}
      onClose={handleSidebarClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: ['100%', 400] } }}
    >
      <Box className='flex justify-between items-center sidebar-header pli-5 plb-4 border-be'>
        <Typography variant='h5'>{isNewEvent ? 'Agregar Evento' : 'Editar Evento'}</Typography>
        <Box className='flex items-center' sx={{ gap: !isNewEvent ? 1 : 0 }}>
          {!isNewEvent && (
            <IconButton size='small' onClick={handleDeleteButtonClick} disabled={isSubmitting}>
              <i className='ri-delete-bin-7-line text-2xl' />
            </IconButton>
          )}
          <IconButton size='small' onClick={handleSidebarClose}>
            <i className='ri-close-line text-2xl' />
          </IconButton>
        </Box>
      </Box>
      <ScrollWrapper
        {...(isBelowSmScreen
          ? { className: 'bs-full overflow-y-auto overflow-x-hidden' }
          : { options: { wheelPropagation: false, suppressScrollX: true } })}
      >
        <Box className='sidebar-body plb-5 pli-6'>
          <form onSubmit={handleSubmit(onSubmit)} autoComplete='off'>
            <FormControl fullWidth className='mbe-6'>
              <Controller
                name='title'
                control={control}
                rules={{ required: true }}
                render={({ field: { value, onChange } }) => (
                  <TextField
                    label='Título'
                    value={value}
                    onChange={onChange}
                    {...(errors.title && { error: true, helperText: 'Este campo es requerido' })}
                  />
                )}
              />
            </FormControl>
            <FormControl fullWidth className='mbe-6'>
              <InputLabel id='event-category'>Categoría</InputLabel>
              <Select
                label='Categoría'
                value={values.category}
                labelId='event-category'
                onChange={e => setValues({ ...values, category: e.target.value as CalendarCategory })}
              >
                {categoryOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <div className='mbe-6'>
              <AppReactDatepicker
                selectsStart
                id='event-start-date'
                endDate={values.endDate}
                selected={values.startDate}
                startDate={values.startDate}
                showTimeSelect={!values.allDay}
                dateFormat={!values.allDay ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd'}
                customInput={<PickersComponent label='Fecha Inicio' registername='startDate' />}
                onChange={(date: Date | null) => date !== null && setValues({ ...values, startDate: new Date(date) })}
                onSelect={handleStartDate}
              />
            </div>
            <div className='mbe-6'>
              <AppReactDatepicker
                selectsEnd
                id='event-end-date'
                endDate={values.endDate}
                selected={values.endDate}
                minDate={values.startDate}
                startDate={values.startDate}
                showTimeSelect={!values.allDay}
                dateFormat={!values.allDay ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd'}
                customInput={<PickersComponent label='Fecha Fin' registername='endDate' />}
                onChange={(date: Date | null) => date !== null && setValues({ ...values, endDate: new Date(date) })}
              />
            </div>
            <FormControl className='mbe-6'>
              <FormControlLabel
                label='Todo el día'
                control={
                  <Switch checked={values.allDay} onChange={e => setValues({ ...values, allDay: e.target.checked })} />
                }
              />
            </FormControl>
            <TextField
              fullWidth
              className='mbe-6'
              label='Ubicación'
              placeholder='Ej: Auditorio Principal'
              value={values.location}
              onChange={e => setValues({ ...values, location: e.target.value })}
            />
            <TextField
              fullWidth
              type='url'
              id='event-url'
              className='mbe-6'
              label='URL (opcional)'
              placeholder='https://...'
              value={values.url}
              onChange={e => setValues({ ...values, url: e.target.value })}
            />
            <TextField
              rows={4}
              multiline
              fullWidth
              className='mbe-6'
              label='Descripción'
              id='event-description'
              placeholder='Detalles del evento...'
              value={values.description}
              onChange={e => setValues({ ...values, description: e.target.value })}
            />
            <div className='flex items-center'>
              <RenderSidebarFooter />
            </div>
          </form>
        </Box>
      </ScrollWrapper>
    </Drawer>
  )
}

export default EventDrawer
