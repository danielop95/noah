'use server'

import prisma from '@/libs/prisma'
import { requireAdmin, getAdminOrganizationId } from './helpers'

export async function getAllUsers() {
  const session = await requireAdmin()
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
      role: true,
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
      groupLeaderships: {
        select: {
          group: {
            select: { id: true, name: true }
          }
        }
      }
    }
  })

  return users
}

export async function getUserById(id: string) {
  const session = await requireAdmin()
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organización')
  }

  const user = await prisma.user.findUnique({
    where: { id }
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
    role?: string
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
  const session = await requireAdmin()
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
    data: updateData
  })

  const { password: _, ...profile } = user

  return profile
}

export async function deactivateUser(id: string) {
  const session = await requireAdmin()

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
    data: { isActive: false }
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
  const session = await requireAdmin()

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
