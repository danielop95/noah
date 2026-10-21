'use server'

import prisma from '@/libs/prisma'
import { requirePermission, getAdminOrganizationId } from './helpers'

export async function getAllUsers() {
  const session = await requirePermission('usuarios', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organización')
  }

  const users = await prisma.user.findMany({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      roleId: true,
      userRole: {
        select: { id: true, name: true, slug: true, hierarchy: true }
      },
      firstName: true,
      lastName: true,
      phone: true,
      city: true,
      isActive: true,
      createdAt: true,
      networkId: true,
      networkRole: true,
      network: {
        select: { id: true, name: true }
      },
      groupId: true,
      groupRole: true,
      group: {
        select: { id: true, name: true }
      }
    }
  })

  return users
}

export async function getUserById(id: string) {
  const session = await requirePermission('usuarios', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organización')
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userRole: {
        select: { id: true, name: true, slug: true, hierarchy: true }
      }
    }
  })

  if (!user) return null

  // Verificar que el usuario pertenece a la misma organización
  if (user.organizationId !== organizationId) {
    throw new Error('No autorizado para ver este usuario')
  }

  const { password: _, ...profile } = user

  return profile
}

export async function updateUserByAdmin(
  id: string,
  data: {
    roleId?: string
    isActive?: boolean
    firstName?: string
    lastName?: string
    phone?: string
    email?: string
    documentType?: string
    documentNumber?: string
    gender?: string
    birthDate?: string | null
    maritalStatus?: string
    hasChildren?: boolean
    childrenCount?: number
    country?: string
    city?: string
    address?: string
    neighborhood?: string
  }
) {
  const session = await requirePermission('usuarios', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organización')
  }

  // Verificar que el usuario a editar pertenece a la misma organización
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { organizationId: true }
  })

  if (targetUser?.organizationId !== organizationId) {
    throw new Error('No autorizado para editar este usuario')
  }

  const updateData: Record<string, unknown> = { ...data }

  if (data.firstName && data.lastName) {
    updateData.name = `${data.firstName} ${data.lastName}`
  }

  if (data.birthDate) {
    updateData.birthDate = new Date(data.birthDate)
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    include: {
      userRole: {
        select: { id: true, name: true, slug: true, hierarchy: true }
      }
    }
  })

  const { password: _, ...profile } = user

  return profile
}

export async function deactivateUser(id: string) {
  const session = await requirePermission('usuarios', 'eliminar')

  if (session.user.id === id) {
    throw new Error('No puedes desactivar tu propia cuenta')
  }

  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organización')
  }

  // Verificar que el usuario a desactivar pertenece a la misma organización
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { organizationId: true }
  })

  if (targetUser?.organizationId !== organizationId) {
    throw new Error('No autorizado para desactivar este usuario')
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    include: {
      userRole: {
        select: { id: true, name: true, slug: true, hierarchy: true }
      }
    }
  })

  const { password: _, ...profile } = user

  return profile
}

export async function updateOrganizationSettings(
  organizationId: string,
  data: {
    name?: string
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string | null
  }
) {
  const session = await requirePermission('configuracion', 'editar')

  // Verificar que el admin pertenece a esta organizacion
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true }
  })

  if (user?.organizationId !== organizationId) {
    throw new Error('No autorizado para modificar esta organizacion')
  }

  const updateData: Record<string, unknown> = {}

  if (data.name) {
    updateData.name = data.name
  }

  if (data.primaryColor || data.secondaryColor) {
    // Obtener colores actuales
    const currentOrg = await prisma.organization.findUnique({
      where: { id: organizationId }
    })

    const currentColors = (currentOrg?.colors as { primary?: string; secondary?: string }) || {}

    updateData.colors = {
      primary: data.primaryColor || currentColors.primary || '#0466C8',
      secondary: data.secondaryColor || currentColors.secondary || '#001845'
    }
  }

  if (data.logoUrl !== undefined) {
    updateData.logoUrl = data.logoUrl
  }

  const organization = await prisma.organization.update({
    where: { id: organizationId },
    data: updateData
  })

  return organization
}

// ============================================
// VACATION PERIODS
// ============================================

export type VacationPeriodData = {
  id: string
  name: string | null
  startDate: Date
  endDate: Date
  createdAt: Date
}

export async function getVacationPeriods(): Promise<VacationPeriodData[]> {
  const session = await requirePermission('configuracion', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organización')
  }

  return prisma.vacationPeriod.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      createdAt: true
    },
    orderBy: { startDate: 'desc' }
  })
}

export async function createVacationPeriod(data: {
  name?: string
  startDate: string
  endDate: string
}): Promise<VacationPeriodData> {
  const session = await requirePermission('configuracion', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organización')
  }

  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)

  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)

  if (startDate > endDate) {
    throw new Error('La fecha de inicio debe ser anterior o igual a la fecha de fin')
  }

  // Check for overlapping periods
  const overlap = await prisma.vacationPeriod.findFirst({
    where: {
      organizationId,
      OR: [
        { startDate: { lte: endDate }, endDate: { gte: startDate } }
      ]
    }
  })

  if (overlap) {
    throw new Error('Este periodo se superpone con otro periodo de vacaciones existente')
  }

  return prisma.vacationPeriod.create({
    data: {
      name: data.name?.trim() || null,
      startDate,
      endDate,
      organizationId
    },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      createdAt: true
    }
  })
}

export async function updateVacationPeriod(
  id: string,
  data: {
    name?: string | null
    startDate?: string
    endDate?: string
  }
): Promise<VacationPeriodData> {
  const session = await requirePermission('configuracion', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organización')
  }

  const existing = await prisma.vacationPeriod.findUnique({ where: { id } })

  if (!existing || existing.organizationId !== organizationId) {
    throw new Error('Periodo de vacaciones no encontrado')
  }

  const startDate = data.startDate ? new Date(data.startDate) : existing.startDate
  const endDate = data.endDate ? new Date(data.endDate) : existing.endDate

  if (data.startDate) startDate.setHours(0, 0, 0, 0)
  if (data.endDate) endDate.setHours(0, 0, 0, 0)

  if (startDate > endDate) {
    throw new Error('La fecha de inicio debe ser anterior o igual a la fecha de fin')
  }

  // Check for overlapping periods (excluding self)
  const overlap = await prisma.vacationPeriod.findFirst({
    where: {
      organizationId,
      NOT: { id },
      OR: [
        { startDate: { lte: endDate }, endDate: { gte: startDate } }
      ]
    }
  })

  if (overlap) {
    throw new Error('Este periodo se superpone con otro periodo de vacaciones existente')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {}

  if (data.name !== undefined) updateData.name = data.name?.trim() || null
  if (data.startDate) updateData.startDate = startDate
  if (data.endDate) updateData.endDate = endDate

  return prisma.vacationPeriod.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      createdAt: true
    }
  })
}

export async function deleteVacationPeriod(id: string) {
  const session = await requirePermission('configuracion', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organización')
  }

  const existing = await prisma.vacationPeriod.findUnique({ where: { id } })

  if (!existing || existing.organizationId !== organizationId) {
    throw new Error('Periodo de vacaciones no encontrado')
  }

  await prisma.vacationPeriod.delete({ where: { id } })

  return { success: true }
}
