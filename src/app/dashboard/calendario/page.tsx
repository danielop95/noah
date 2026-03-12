// Next Imports
import { getServerSession } from 'next-auth'

// Auth
import { authOptions } from '@/libs/auth'

// Component Imports
import CalendarioView from '@/views/calendario'
import AppFullCalendar from '@/libs/styles/AppFullCalendar'

// Server Actions
import { getAllCalendarEvents } from '@/app/server/calendarActions'

const CalendarioPage = async () => {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user?.roleHierarchy ?? 999) <= 2

  // Obtener eventos del servidor
  const events = await getAllCalendarEvents()

  return (
    <AppFullCalendar className='app-calendar'>
      <CalendarioView initialEvents={events} isAdmin={isAdmin} />
    </AppFullCalendar>
  )
}

export default CalendarioPage
