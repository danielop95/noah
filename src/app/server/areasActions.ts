'use server'

import { AreaMembershipRole, Prisma } from '@prisma/client'

import prisma from '@/libs/prisma'

import { requirePermission, getAdminOrganizationId } from './helpers'

export type AreaListItem = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  _count: { memberships: number; solicitudAreas: number }
}

function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getAllAreas(): Promise<AreaListItem[]> {
  const session = await requirePermission('areas', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  return prisma.area.findMany({
    where: { organizationId },
    include: {
      _count: { select: { memberships: true, solicitudAreas: true } }
    },
    orderBy: { name: 'asc' }
  })
}

export async function getAreaById(id: string) {
  const session = await requirePermission('areas', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  const area = await prisma.area.findUnique({
    where: { id },
    include: {
      memberships: {
        include: {
          user: {
            select: {
              id: true, name: true, firstName: true, lastName: true,
              email: true, phone: true, image: true, isActive: true
            }
          }
        },
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }]
      },
      _count: { select: { memberships: true, solicitudAreas: true } }
    }
  })

  if (!area || area.organizationId !== organizationId) {
    throw new Error('Área no encontrada o no autorizado')
  }

  return area
}

export async function createArea(data: {
  name: string
  description?: string | null
  icon?: string | null
  color?: string | null
}) {
  const session = await requirePermission('areas', 'crear')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  const name = data.name.trim()

  if (!name) throw new Error('El nombre del área es obligatorio')

  const baseSlug = slugify(name)

  if (!baseSlug) throw new Error('El nombre del área no es válido')

  // Resolver colisiones de slug
  let slug = baseSlug
  let i = 2

  while (await prisma.area.findUnique({ where: { organizationId_slug: { organizationId, slug } }, select: { id: true } })) {
    slug = `${baseSlug}-${i++}`
  }

  return prisma.area.create({
    data: {
      organizationId,
      name,
      slug,
      description: data.description ?? null,
      icon: data.icon ?? null,
      color: data.color ?? null,
      isActive: true
    }
  })
}

export async function updateArea(
  id: string,
  data: {
    name?: string
    description?: string | null
    icon?: string | null
    color?: string | null
    isActive?: boolean
  }
) {
  const session = await requirePermission('areas', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  const area = await prisma.area.findUnique({ where: { id }, select: { organizationId: true } })

  if (!area || area.organizationId !== organizationId) {
    throw new Error('Área no encontrada o no autorizado')
  }

  const updateData: Prisma.AreaUpdateInput = {}

  if (data.name !== undefined) updateData.name = data.name.trim()
  if (data.description !== undefined) updateData.description = data.description
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.color !== undefined) updateData.color = data.color
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  return prisma.area.update({ where: { id }, data: updateData })
}

export async function deleteArea(id: string) {
  const session = await requirePermission('areas', 'eliminar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  const area = await prisma.area.findUnique({
    where: { id },
    select: {
      organizationId: true,
      name: true,
      _count: { select: { solicitudAreas: true, solicitudesOrigen: true } }
    }
  })

  if (!area || area.organizationId !== organizationId) {
    throw new Error('Área no encontrada o no autorizado')
  }

  if (area._count.solicitudAreas > 0 || area._count.solicitudesOrigen > 0) {
    throw new Error(`No se puede eliminar "${area.name}" porque tiene solicitudes asociadas. Desactívela en su lugar.`)
  }

  await prisma.area.delete({ where: { id } })

  return { success: true, name: area.name }
}

export async function getAreasForSelect() {
  const session = await requirePermission('areas', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  return prisma.area.findMany({
    where: { organizationId, isActive: true },
    select: { id: true, name: true, slug: true, icon: true, color: true },
    orderBy: { name: 'asc' }
  })
}

// ============================================
// GESTIÓN DE MIEMBROS
// ============================================

export async function listAreaMemberships(areaId: string) {
  const session = await requirePermission('areas', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  const area = await prisma.area.findUnique({ where: { id: areaId }, select: { organizationId: true } })

  if (!area || area.organizationId !== organizationId) {
    throw new Error('Área no encontrada o no autorizado')
  }

  return prisma.areaMembership.findMany({
    where: { areaId },
    include: {
      user: {
        select: {
          id: true, name: true, firstName: true, lastName: true,
          email: true, phone: true, image: true, isActive: true
        }
      }
    },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }]
  })
}

export async function addAreaMember(areaId: string, userId: string, role: AreaMembershipRole) {
  const session = await requirePermission('areas', 'gestionarMiembros')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  const area = await prisma.area.findUnique({ where: { id: areaId }, select: { organizationId: true } })

  if (!area || area.organizationId !== organizationId) {
    throw new Error('Área no encontrada o no autorizado')
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { organizationId: true, name: true } })

  if (!user || user.organizationId !== organizationId) {
    throw new Error('Usuario no pertenece a la organización')
  }

  const existing = await prisma.areaMembership.findUnique({
    where: { areaId_userId: { areaId, userId } },
    select: { id: true }
  })

  if (existing) {
    throw new Error(`${user.name || 'El usuario'} ya pertenece a esta área`)
  }

  return prisma.areaMembership.create({
    data: { areaId, userId, role }
  })
}

export async function updateAreaMemberRole(areaId: string, userId: string, role: AreaMembershipRole) {
  const session = await requirePermission('areas', 'gestionarMiembros')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  const area = await prisma.area.findUnique({ where: { id: areaId }, select: { organizationId: true } })

  if (!area || area.organizationId !== organizationId) {
    throw new Error('Área no encontrada o no autorizado')
  }

  const membership = await prisma.areaMembership.findUnique({
    where: { areaId_userId: { areaId, userId } },
    select: { id: true }
  })

  if (!membership) throw new Error('El usuario no pertenece a esta área')

  return prisma.areaMembership.update({
    where: { id: membership.id },
    data: { role }
  })
}

export async function removeAreaMember(areaId: string, userId: string) {
  const session = await requirePermission('areas', 'gestionarMiembros')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  const area = await prisma.area.findUnique({ where: { id: areaId }, select: { organizationId: true } })

  if (!area || area.organizationId !== organizationId) {
    throw new Error('Área no encontrada o no autorizado')
  }

  const membership = await prisma.areaMembership.findUnique({
    where: { areaId_userId: { areaId, userId } },
    select: { id: true }
  })

  if (!membership) throw new Error('El usuario no pertenece a esta área')

  await prisma.areaMembership.delete({ where: { id: membership.id } })

  return { success: true }
}

export async function getAvailableUsersForArea(areaId: string) {
  const session = await requirePermission('areas', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  const existingIds = await prisma.areaMembership.findMany({
    where: { areaId },
    select: { userId: true }
  })

  const excluded = existingIds.map(m => m.userId)

  return prisma.user.findMany({
    where: {
      organizationId,
      isActive: true,
      id: { notIn: excluded }
    },
    select: {
      id: true, name: true, firstName: true, lastName: true,
      image: true, email: true
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }, { name: 'asc' }]
  })
}
