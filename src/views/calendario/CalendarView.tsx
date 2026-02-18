'use client'

// React Imports
import { useEffect, useRef } from 'react'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party imports
import 'bootstrap-icons/font/bootstrap-icons.css'
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventInput } from '@fullcalendar/core'

// Type Imports
import type { CalendarColors, CalendarCategory, CalendarSelectedEvent } from './types'

// Actions
import { updateCalendarEventDates } from '@/app/server/calendarActions'

type Props = {
  events: EventInput[]
  calendarsColor: CalendarColors
  calendarApi: any
  setCalendarApi: (val: any) => void
  selectedCategories: CalendarCategory[]
  isAdmin: boolean
  handleLeftSidebarToggle: () => void
  handleAddEventSidebarToggle: () => void
  setSelectedEvent: (event: CalendarSelectedEvent) => void
}

const blankEvent: CalendarSelectedEvent = {
  title: '',
  start: new Date(),
  end: new Date(),
  allDay: true,
  url: '',
  category: 'evento',
  description: '',
  location: ''
}

const CalendarView = (props: Props) => {
  const {
    events,
    calendarApi,
    setCalendarApi,
    calendarsColor,
    selectedCategories,
    isAdmin,
    handleAddEventSidebarToggle,
    handleLeftSidebarToggle,
    setSelectedEvent
  } = props

  // Refs
  const calendarRef = useRef<FullCalendar>(null)

  // Hooks
  const theme = useTheme()

  useEffect(() => {
    if (calendarApi === null && calendarRef.current) {
      setCalendarApi(calendarRef.current.getApi())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filtrar eventos por categoría seleccionada
  const filteredEvents = events.filter(event => {
    const category = event.extendedProps?.calendar as CalendarCategory

    return selectedCategories.includes(category)
  })

  const calendarOptions: CalendarOptions = {
    events: filteredEvents,
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      start: 'sidebarToggle, prev, next, title',
      end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
    },
    views: {
      week: {
        titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
      }
    },
    locale: 'es',
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Lista'
    },
    editable: isAdmin,
    eventResizableFromStart: isAdmin,
    dragScroll: true,
    dayMaxEvents: 2,
    navLinks: true,

    eventClassNames({ event: calendarEvent }: any) {
      const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar as CalendarCategory]

      return [`event-bg-${colorName}`]
    },

    eventClick({ event: clickedEvent, jsEvent }: any) {
      jsEvent.preventDefault()

      const eventData: CalendarSelectedEvent = {
        id: clickedEvent.id,
        title: clickedEvent.title,
        start: clickedEvent.start,
        end: clickedEvent.end || clickedEvent.start,
        allDay: clickedEvent.allDay,
        url: clickedEvent.url || '',
        category: clickedEvent.extendedProps.calendar || 'evento',
        description: clickedEvent.extendedProps.description || '',
        location: clickedEvent.extendedProps.location || ''
      }

      setSelectedEvent(eventData)
      handleAddEventSidebarToggle()

      if (clickedEvent.url) {
        window.open(clickedEvent.url, '_blank')
      }
    },

    customButtons: {
      sidebarToggle: {
        icon: 'bi bi-list',
        click() {
          handleLeftSidebarToggle()
        }
      }
    },

    dateClick(info: any) {
      if (!isAdmin) return

      const ev = { ...blankEvent }

      ev.start = info.date
      ev.end = info.date

      setSelectedEvent(ev)
      handleAddEventSidebarToggle()
    },

    async eventDrop({ event: droppedEvent }: any) {
      if (!isAdmin) return

      try {
        await updateCalendarEventDates(droppedEvent.id, droppedEvent.start, droppedEvent.end || droppedEvent.start)
      } catch (error) {
        console.error('Error actualizando evento:', error)
      }
    },

    async eventResize({ event: resizedEvent }: any) {
      if (!isAdmin) return

      try {
        await updateCalendarEventDates(resizedEvent.id, resizedEvent.start, resizedEvent.end || resizedEvent.start)
      } catch (error) {
        console.error('Error actualizando evento:', error)
      }
    },

    direction: theme.direction
  }

  return <FullCalendar ref={calendarRef} {...calendarOptions} />
}

export default CalendarView
