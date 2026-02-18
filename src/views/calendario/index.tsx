'use client'

// React Imports
import { useState, useCallback } from 'react'

// MUI Imports
import type { EventInput } from '@fullcalendar/core'

// Component Imports
import CalendarView from './CalendarView'
import CalendarFiltersBar from './CalendarFiltersBar'
import EventDrawer from './EventDrawer'
import DayEventsPopover from './DayEventsPopover'
import EventDetailDialog from './EventDetailDialog'

// Type Imports
import type { CalendarColors, CalendarCategory, CalendarEventData, CalendarSelectedEvent } from './types'

// Server Actions
import { getAllCalendarEvents } from '@/app/server/calendarActions'

// Colores por categoría
const calendarsColor: CalendarColors = {
  culto: 'primary',
  evento: 'warning',
  reunion: 'error',
  actividad: 'success',
  capacitacion: 'info'
}

const allCategories: CalendarCategory[] = ['culto', 'evento', 'reunion', 'actividad', 'capacitacion']

type Props = {
  initialEvents: CalendarEventData[]
  isAdmin: boolean
}

// Convertir datos de servidor a formato FullCalendar
const convertToCalendarEvents = (events: CalendarEventData[]): EventInput[] => {
  return events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.startDate),
    end: new Date(event.endDate),
    allDay: event.allDay,
    url: event.url || undefined,
    extendedProps: {
      calendar: event.category,
      description: event.description,
      location: event.location,
      createdBy: event.createdBy
    }
  }))
}

const CalendarioView = ({ initialEvents, isAdmin }: Props) => {
  // States
  const [events, setEvents] = useState<EventInput[]>(convertToCalendarEvents(initialEvents))
  const [calendarApi, setCalendarApi] = useState<any>(null)
  const [selectedCategories, setSelectedCategories] = useState<CalendarCategory[]>(allCategories)

  // Popover state
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarSelectedEvent>(null)

  // Edit drawer state (solo admin)
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [eventToEdit, setEventToEdit] = useState<CalendarSelectedEvent>(null)

  const handleToggleCategory = (category: CalendarCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  // Recargar eventos
  const handleEventUpdated = useCallback(async () => {
    try {
      const updatedEvents = await getAllCalendarEvents()

      setEvents(convertToCalendarEvents(updatedEvents))
    } catch (error) {
      console.error('Error recargando eventos:', error)
    }
  }, [])

  // Click en día - abre popover
  const handleDateClick = (date: Date, anchorEl: HTMLElement) => {
    setSelectedDate(date)
    setPopoverAnchor(anchorEl)
  }

  // Cerrar popover
  const handleClosePopover = () => {
    setPopoverAnchor(null)
    setSelectedDate(null)
  }

  // Click en evento desde popover - abre dialog de detalle
  const handleEventClickFromPopover = (event: EventInput) => {
    handleClosePopover()

    const eventData: CalendarSelectedEvent = {
      id: event.id as string,
      title: event.title as string,
      start: event.start as Date,
      end: (event.end as Date) || (event.start as Date),
      allDay: event.allDay as boolean,
      url: (event.url as string) || '',
      category: (event.extendedProps?.calendar as CalendarCategory) || 'evento',
      description: (event.extendedProps?.description as string) || '',
      location: (event.extendedProps?.location as string) || ''
    }

    setSelectedEvent(eventData)
    setDetailDialogOpen(true)
  }

  // Click en evento directo desde calendario
  const handleEventClick = (event: EventInput) => {
    const eventData: CalendarSelectedEvent = {
      id: event.id as string,
      title: event.title as string,
      start: event.start as Date,
      end: (event.end as Date) || (event.start as Date),
      allDay: event.allDay as boolean,
      url: (event.url as string) || '',
      category: (event.extendedProps?.calendar as CalendarCategory) || 'evento',
      description: (event.extendedProps?.description as string) || '',
      location: (event.extendedProps?.location as string) || ''
    }

    setSelectedEvent(eventData)
    setDetailDialogOpen(true)
  }

  // Cerrar dialog de detalle
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false)
    setSelectedEvent(null)
  }

  // Abrir drawer de edición (desde dialog o popover)
  const handleOpenEditDrawer = () => {
    if (selectedEvent) {
      setEventToEdit(selectedEvent)
      setDetailDialogOpen(false)
      setEditDrawerOpen(true)
    }
  }

  // Agregar evento desde popover
  const handleAddEventFromPopover = () => {
    handleClosePopover()

    if (selectedDate) {
      const newEvent: CalendarSelectedEvent = {
        title: '',
        start: selectedDate,
        end: selectedDate,
        allDay: true,
        url: '',
        category: 'evento',
        description: '',
        location: ''
      }

      setEventToEdit(newEvent)
      setEditDrawerOpen(true)
    }
  }

  // Agregar evento desde barra de filtros
  const handleAddEvent = () => {
    const newEvent: CalendarSelectedEvent = {
      title: '',
      start: new Date(),
      end: new Date(),
      allDay: true,
      url: '',
      category: 'evento',
      description: '',
      location: ''
    }

    setEventToEdit(newEvent)
    setEditDrawerOpen(true)
  }

  // Cerrar drawer de edición
  const handleCloseEditDrawer = () => {
    setEditDrawerOpen(false)
    setEventToEdit(null)
  }

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    const category = event.extendedProps?.calendar as CalendarCategory

    return selectedCategories.includes(category)
  })

  return (
    <div className='p-4 sm:p-5 bg-backgroundPaper rounded-lg shadow-sm w-full'>
      {/* Barra de filtros y botón agregar */}
      <CalendarFiltersBar
        isAdmin={isAdmin}
        calendarsColor={calendarsColor}
        selectedCategories={selectedCategories}
        handleAddEvent={handleAddEvent}
        handleToggleCategory={handleToggleCategory}
      />

      {/* Calendario */}
      <CalendarView
        events={events}
        calendarApi={calendarApi}
        setCalendarApi={setCalendarApi}
        calendarsColor={calendarsColor}
        selectedCategories={selectedCategories}
        isAdmin={isAdmin}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
      />

      {/* Popover de eventos del día */}
      <DayEventsPopover
        anchorEl={popoverAnchor}
        selectedDate={selectedDate}
        events={filteredEvents}
        calendarsColor={calendarsColor}
        isAdmin={isAdmin}
        onClose={handleClosePopover}
        onEventClick={handleEventClickFromPopover}
        onAddEvent={handleAddEventFromPopover}
      />

      {/* Dialog de detalle de evento */}
      <EventDetailDialog
        open={detailDialogOpen}
        event={selectedEvent}
        onClose={handleCloseDetailDialog}
        onEdit={handleOpenEditDrawer}
        isAdmin={isAdmin}
      />

      {/* Drawer de edición (solo admin) */}
      {isAdmin && (
        <EventDrawer
          drawerOpen={editDrawerOpen}
          selectedEvent={eventToEdit}
          handleDrawerToggle={handleCloseEditDrawer}
          onEventUpdated={handleEventUpdated}
        />
      )}
    </div>
  )
}

export default CalendarioView
