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
import type { CalendarColors, CalendarCategory } from './types'

// Actions
import { updateCalendarEventDates } from '@/app/server/calendarActions'

type Props = {
  events: EventInput[]
  calendarsColor: CalendarColors
  calendarApi: any
  setCalendarApi: (val: any) => void
  selectedCategories: CalendarCategory[]
  isAdmin: boolean
  onDateClick: (date: Date, anchorEl: HTMLElement) => void
  onEventClick: (event: EventInput) => void
}

const CalendarView = (props: Props) => {
  const {
    events,
    calendarApi,
    setCalendarApi,
    calendarsColor,
    selectedCategories,
    isAdmin,
    onDateClick,
    onEventClick
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
      start: 'prev, next, title',
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
    dayMaxEvents: 3,
    navLinks: true,
    fixedWeekCount: false,
    showNonCurrentDates: true,
    aspectRatio: 1.5,

    // Estilos mejorados para eventos
    eventClassNames({ event: calendarEvent }: any) {
      const colorName = calendarsColor[calendarEvent._def.extendedProps.calendar as CalendarCategory]

      return [`event-bg-${colorName}`, 'event-modern']
    },

    // Click en evento individual
    eventClick({ event: clickedEvent, jsEvent }: any) {
      jsEvent.preventDefault()
      jsEvent.stopPropagation()

      // Encontrar el evento completo con todos los datos
      const fullEvent = events.find(e => e.id === clickedEvent.id)

      if (fullEvent) {
        onEventClick(fullEvent)
      }
    },

    // Click en celda de día - abre popover
    dateClick(info: any) {
      onDateClick(info.date, info.dayEl)
    },

    // Drag & drop (solo admin)
    async eventDrop({ event: droppedEvent }: any) {
      if (!isAdmin) return

      try {
        await updateCalendarEventDates(droppedEvent.id, droppedEvent.start, droppedEvent.end || droppedEvent.start)
      } catch (error) {
        console.error('Error actualizando evento:', error)
      }
    },

    // Resize (solo admin)
    async eventResize({ event: resizedEvent }: any) {
      if (!isAdmin) return

      try {
        await updateCalendarEventDates(resizedEvent.id, resizedEvent.start, resizedEvent.end || resizedEvent.start)
      } catch (error) {
        console.error('Error actualizando evento:', error)
      }
    },

    // Hover effects en día
    dayCellDidMount(info) {
      info.el.style.cursor = 'pointer'
      info.el.style.transition = 'all 0.2s ease'
    },

    direction: theme.direction
  }

  return <FullCalendar ref={calendarRef} {...calendarOptions} />
}

export default CalendarView
