'use client'

// React Imports
import { useState, useCallback } from 'react'

// MUI Imports
import { useMediaQuery } from '@mui/material'
import type { Theme } from '@mui/material/styles'
import type { EventInput } from '@fullcalendar/core'

// Component Imports
import CalendarView from './CalendarView'
import CalendarSidebar from './CalendarSidebar'
import EventDrawer from './EventDrawer'
import EventDetailDrawer from './EventDetailDrawer'

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
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false)
  const [addEventSidebarOpen, setAddEventSidebarOpen] = useState<boolean>(false)
  const [selectedCategories, setSelectedCategories] = useState<CalendarCategory[]>(allCategories)
  const [selectedEvent, setSelectedEvent] = useState<CalendarSelectedEvent>(null)

  // Hooks
  const mdAbove = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const handleLeftSidebarToggle = () => setLeftSidebarOpen(!leftSidebarOpen)
  const handleAddEventSidebarToggle = () => {
    if (addEventSidebarOpen) {
      setSelectedEvent(null)
    }

    setAddEventSidebarOpen(!addEventSidebarOpen)
  }

  const handleToggleCategory = (category: CalendarCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleToggleAll = (checked: boolean) => {
    setSelectedCategories(checked ? allCategories : [])
  }

  const handleEventUpdated = useCallback(async () => {
    // Recargar eventos desde el servidor
    try {
      const updatedEvents = await getAllCalendarEvents()

      setEvents(convertToCalendarEvents(updatedEvents))
    } catch (error) {
      console.error('Error recargando eventos:', error)
    }
  }, [])

  return (
    <>
      <CalendarSidebar
        mdAbove={mdAbove}
        calendarApi={calendarApi}
        calendarsColor={calendarsColor}
        leftSidebarOpen={leftSidebarOpen}
        selectedCategories={selectedCategories}
        isAdmin={isAdmin}
        handleLeftSidebarToggle={handleLeftSidebarToggle}
        handleAddEventSidebarToggle={handleAddEventSidebarToggle}
        handleToggleCategory={handleToggleCategory}
        handleToggleAll={handleToggleAll}
      />
      <div className='p-5 pbe-0 grow overflow-visible bg-backgroundPaper rounded'>
        <CalendarView
          events={events}
          calendarApi={calendarApi}
          setCalendarApi={setCalendarApi}
          calendarsColor={calendarsColor}
          selectedCategories={selectedCategories}
          isAdmin={isAdmin}
          handleLeftSidebarToggle={handleLeftSidebarToggle}
          handleAddEventSidebarToggle={handleAddEventSidebarToggle}
          setSelectedEvent={setSelectedEvent}
        />
      </div>
      {isAdmin ? (
        <EventDrawer
          drawerOpen={addEventSidebarOpen}
          selectedEvent={selectedEvent}
          handleDrawerToggle={handleAddEventSidebarToggle}
          onEventUpdated={handleEventUpdated}
        />
      ) : (
        <EventDetailDrawer
          drawerOpen={addEventSidebarOpen}
          selectedEvent={selectedEvent}
          handleDrawerToggle={handleAddEventSidebarToggle}
        />
      )}
    </>
  )
}

export default CalendarioView
