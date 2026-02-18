import type { ThemeColor } from '@core/types'

export type CalendarCategory = 'culto' | 'evento' | 'reunion' | 'actividad' | 'capacitacion'

export type CalendarColors = Record<CalendarCategory, ThemeColor>

export type CalendarEventData = {
  id: string
  title: string
  description: string | null
  startDate: Date | string
  endDate: Date | string
  allDay: boolean
  category: string
  url: string | null
  location: string | null
  createdBy: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    image: string | null
  }
}

export type CalendarSelectedEvent = {
  id?: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  url: string
  category: CalendarCategory
  description: string
  location: string
} | null
