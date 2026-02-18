'use server'

import prisma from '@/libs/prisma'
import { requireAuth, requireAdmin, getUserOrganizationId } from './helpers'

// Tipos
export type CalendarEventInput = {
  title: string
  description?: string
  startDate: Date | string
  endDate: Date | string
  allDay?: boolean
  category?: string
  url?: string
  location?: string
}

// ===================
// Obtener Eventos
// ===================

export async function getAllCalendarEvents() {
  const session = await requireAuth()
  const organizationId = await getUserOrganizationId(session.user.id)

  if (!organizationId) {
    return []
  }

  const events = await prisma.calendarEvent.findMany({
    where: {
      organizationId,
      isActive: true
    },
    orderBy: { startDate: 'asc' },
    select: {
      id: true,
      title: true,
      description: true,
      startDate: true,
      endDate: true,
      allDay: true,
      category: true,
      url: true,
      location: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true
        }
      }
    }
  })

  return events
}

export async function getCalendarEventById(id: string) {
  const session = await requireAuth()
  const organizationId = await getUserOrganizationId(session.user.id)

  if (!organizationId) {
    return null
  }

  const event = await prisma.calendarEvent.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true
        }
      }
    }
  })

  if (!event || event.organizationId !== organizationId) {
    return null
  }

  return event
}

// ===================
// Crear Evento (Solo Admin)
// ===================

export async function createCalendarEvent(data: CalendarEventInput) {
  const session = await requireAdmin()
  const organizationId = await getUserOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organización')
  }

  const event = await prisma.calendarEvent.create({
    data: {
      title: data.title,
      description: data.description || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      allDay: data.allDay ?? false,
      category: data.category || 'evento',
      url: data.url || null,
      location: data.location || null,
      createdById: session.user.id,
      organizationId
    }
  })

  return event
}

// ===================
// Actualizar Evento (Solo Admin)
// ===================

export async function updateCalendarEvent(id: string, data: Partial<CalendarEventInput>) {
  const session = await requireAdmin()
  const organizationId = await getUserOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organización')
  }

  // Verificar que el evento pertenece a la organización
  const existingEvent = await prisma.calendarEvent.findUnique({
    where: { id },
    select: { organizationId: true }
  })

  if (!existingEvent || existingEvent.organizationId !== organizationId) {
    throw new Error('Evento no encontrado')
  }

  const updateData: Record<string, unknown> = {}

  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate)
  if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate)
  if (data.allDay !== undefined) updateData.allDay = data.allDay
  if (data.category !== undefined) updateData.category = data.category
  if (data.url !== undefined) updateData.url = data.url
  if (data.location !== undefined) updateData.location = data.location

  const event = await prisma.calendarEvent.update({
    where: { id },
    data: updateData
  })

  return event
}

// ===================
// Eliminar Evento (Solo Admin)
// ===================

export async function deleteCalendarEvent(id: string) {
  const session = await requireAdmin()
  const organizationId = await getUserOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organización')
  }

  // Verificar que el evento pertenece a la organización
  const existingEvent = await prisma.calendarEvent.findUnique({
    where: { id },
    select: { organizationId: true }
  })

  if (!existingEvent || existingEvent.organizationId !== organizationId) {
    throw new Error('Evento no encontrado')
  }

  await prisma.calendarEvent.delete({
    where: { id }
  })

  return { success: true }
}

// ===================
// Actualizar fechas (drag & drop)
// ===================

export async function updateCalendarEventDates(id: string, startDate: Date | string, endDate: Date | string) {
  const session = await requireAdmin()
  const organizationId = await getUserOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organización')
  }

  const existingEvent = await prisma.calendarEvent.findUnique({
    where: { id },
    select: { organizationId: true }
  })

  if (!existingEvent || existingEvent.organizationId !== organizationId) {
    throw new Error('Evento no encontrado')
  }

  const event = await prisma.calendarEvent.update({
    where: { id },
    data: {
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    }
  })

  return event
}
