'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/libs/prisma'
import { requirePermission, getCurrentUserWithRoles } from '@/libs/permissions-server'

// Tipos
export type ServiceAreaData = {
  name: string
  description?: string
  color?: string
  icon?: string
}

export type ServiceAreaWithRelations = Awaited<ReturnType<typeof getAllServiceAreas>>[number]

/**
 * Obtener todas las áreas de servicio (admin/pastor)
 */
export async function getAllServiceAreas() {
  const user = await requirePermission('areas:read:all')

  return prisma.serviceArea.findMany({
    where: {
      organizationId: user.organizationId!,
      isActive: true
    },
    include: {
      leaders: {
        include: {
          user: {
            select: { id: true, name: true, image: true, email: true }
          }
        }
      },
      volunteers: {
        where: { isActive: true },
        include: {
          user: {
            select: { id: true, name: true, image: true, email: true }
          }
        }
      },
      _count: {
        select: { events: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

/**
 * Obtener áreas del usuario actual (líderes/voluntarios)
 */
export async function getMyServiceAreas() {
  const user = await getCurrentUserWithRoles()

  if (!user) throw new Error('No autenticado')

  const areaIds = [
    ...(user.ledServiceAreas?.map(a => a.serviceAreaId) || []),
    ...(user.volunteerAreas?.filter(a => a.isActive).map(a => a.serviceAreaId) || [])
  ]

  if (areaIds.length === 0) return []

  return prisma.serviceArea.findMany({
    where: {
      id: { in: areaIds },
      isActive: true
    },
    include: {
      leaders: {
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      },
      volunteers: {
        where: { isActive: true },
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  })
}

/**
 * Obtener un área por ID
 */
export async function getServiceAreaById(id: string) {
  const user = await getCurrentUserWithRoles()

  if (!user) throw new Error('No autenticado')

  const area = await prisma.serviceArea.findUnique({
    where: { id },
    include: {
      leaders: {
        include: {
          user: {
            select: { id: true, name: true, image: true, email: true }
          }
        }
      },
      volunteers: {
        where: { isActive: true },
        include: {
          user: {
            select: { id: true, name: true, image: true, email: true }
          }
        }
      },
      events: {
        where: { isActive: true },
        orderBy: { startDate: 'asc' },
        take: 10
      }
    }
  })

  return area
}

/**
 * Crear un área de servicio
 */
export async function createServiceArea(data: ServiceAreaData) {
  const user = await requirePermission('areas:create')

  const area = await prisma.serviceArea.create({
    data: {
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon,
      organizationId: user.organizationId!
    }
  })

  revalidatePath('/admin/areas')

  return area
}

/**
 * Actualizar un área de servicio
 */
export async function updateServiceArea(id: string, data: Partial<ServiceAreaData>) {
  await requirePermission('areas:update')

  const area = await prisma.serviceArea.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      color: data.color,
      icon: data.icon
    }
  })

  revalidatePath('/admin/areas')

  return area
}

/**
 * Eliminar un área de servicio (soft delete)
 */
export async function deleteServiceArea(id: string) {
  await requirePermission('areas:delete')

  await prisma.serviceArea.update({
    where: { id },
    data: { isActive: false }
  })

  revalidatePath('/admin/areas')
}

/**
 * Asignar un líder a un área
 */
export async function assignAreaLeader(areaId: string, userId: string) {
  await requirePermission('areas:update')

  // Verificar que no sea ya líder
  const existing = await prisma.serviceAreaLeader.findUnique({
    where: { userId_serviceAreaId: { userId, serviceAreaId: areaId } }
  })

  if (existing) {
    throw new Error('El usuario ya es líder de esta área')
  }

  await prisma.serviceAreaLeader.create({
    data: { serviceAreaId: areaId, userId }
  })

  revalidatePath('/admin/areas')
}

/**
 * Remover un líder de un área
 */
export async function removeAreaLeader(areaId: string, userId: string) {
  await requirePermission('areas:update')

  await prisma.serviceAreaLeader.delete({
    where: { userId_serviceAreaId: { userId, serviceAreaId: areaId } }
  })

  revalidatePath('/admin/areas')
}

/**
 * Asignar un voluntario a un área
 */
export async function assignVolunteer(areaId: string, userId: string, notes?: string) {
  const user = await requirePermission('areas:assign_volunteers', { areaId })

  // Verificar si ya existe (puede estar inactivo)
  const existing = await prisma.volunteerAssignment.findUnique({
    where: { userId_serviceAreaId: { userId, serviceAreaId: areaId } }
  })

  if (existing) {
    // Reactivar si estaba inactivo
    if (!existing.isActive) {
      await prisma.volunteerAssignment.update({
        where: { id: existing.id },
        data: { isActive: true, notes }
      })
    } else {
      throw new Error('El usuario ya es voluntario de esta área')
    }
  } else {
    await prisma.volunteerAssignment.create({
      data: { serviceAreaId: areaId, userId, notes }
    })
  }

  revalidatePath('/admin/areas')
}

/**
 * Remover un voluntario de un área (soft delete)
 */
export async function removeVolunteer(areaId: string, userId: string) {
  await requirePermission('areas:assign_volunteers', { areaId })

  await prisma.volunteerAssignment.update({
    where: { userId_serviceAreaId: { userId, serviceAreaId: areaId } },
    data: { isActive: false }
  })

  revalidatePath('/admin/areas')
}

/**
 * Obtener usuarios disponibles para asignar a un área
 */
export async function getAvailableUsersForArea(areaId: string) {
  const user = await requirePermission('areas:assign_volunteers', { areaId })

  // Obtener IDs de usuarios ya asignados (líderes o voluntarios activos)
  const area = await prisma.serviceArea.findUnique({
    where: { id: areaId },
    include: {
      leaders: { select: { userId: true } },
      volunteers: { where: { isActive: true }, select: { userId: true } }
    }
  })

  const assignedIds = [...(area?.leaders.map(l => l.userId) || []), ...(area?.volunteers.map(v => v.userId) || [])]

  // Obtener usuarios de la organización que no están asignados
  return prisma.user.findMany({
    where: {
      organizationId: user.organizationId!,
      isActive: true,
      id: { notIn: assignedIds }
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    },
    orderBy: { name: 'asc' }
  })
}
