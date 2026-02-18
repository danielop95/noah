'use server'

import prisma from '@/libs/prisma'
import { requireAdmin, getAdminOrganizationId } from './helpers'

// Tipos para las respuestas
export type GroupLeaderInfo = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  image: string | null
  email: string | null
}

export type GroupWithDetails = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  modality: string
  city: string | null
  address: string | null
  neighborhood: string | null
  meetingDay: string | null
  meetingTime: string | null
  createdAt: Date
  updatedAt: Date
  networkId: string
  network: { id: string; name: string }
  leaders: { user: GroupLeaderInfo }[]
  _count: { leaders: number }
}

export type NetworkOption = {
  id: string
  name: string
  imageUrl: string | null
  users: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    image: string | null
    email: string | null
  }[]
}

export async function getAllGroups(): Promise<GroupWithDetails[]> {
  const session = await requireAdmin()
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organizacion')
  }

  const groups = await prisma.group.findMany({
    where: { organizationId },
    include: {
      network: {
        select: { id: true, name: true }
      },
      leaders: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              image: true,
              email: true
            }
          }
        }
      },
      _count: {
        select: { leaders: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return groups as GroupWithDetails[]
}

export async function getGroupById(id: string) {
  const session = await requireAdmin()
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organizacion')
  }

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      network: {
        select: { id: true, name: true }
      },
      leaders: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              image: true,
              email: true
            }
          }
        }
      }
    }
  })

  if (!group || group.organizationId !== organizationId) {
    throw new Error('Grupo no encontrado o no autorizado')
  }

  return group
}

export async function createGroup(data: {
  name: string
  description?: string
  imageUrl?: string
  networkId: string
  modality: string
  city?: string
  address?: string
  neighborhood?: string
  meetingDay?: string
  meetingTime?: string
  leaderIds: string[]
}) {
  const session = await requireAdmin()
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organizacion')
  }

  // Validar que hay al menos un líder
  if (data.leaderIds.length === 0) {
    throw new Error('Debe haber al menos un lider en el grupo')
  }

  // Validar que la red existe y pertenece a la organización
  const network = await prisma.network.findUnique({
    where: { id: data.networkId },
    select: { id: true, organizationId: true }
  })

  if (!network || network.organizationId !== organizationId) {
    throw new Error('Red no encontrada o no autorizada')
  }

  // Validar que los líderes pertenecen a la red seleccionada
  const leaders = await prisma.user.findMany({
    where: {
      id: { in: data.leaderIds },
      networkId: data.networkId
    },
    select: { id: true, name: true }
  })

  if (leaders.length !== data.leaderIds.length) {
    throw new Error('Algunos lideres no pertenecen a la red seleccionada')
  }

  // Validar ubicación si es presencial
  if (data.modality === 'presencial' && !data.city?.trim()) {
    throw new Error('Para grupos presenciales, el municipio/ciudad es requerido')
  }

  // Crear grupo y asignar líderes en transacción
  const group = await prisma.$transaction(async tx => {
    const created = await tx.group.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        networkId: data.networkId,
        organizationId,
        modality: data.modality,
        city: data.modality === 'presencial' ? data.city : null,
        address: data.modality === 'presencial' ? data.address : null,
        neighborhood: data.modality === 'presencial' ? data.neighborhood : null,
        meetingDay: data.meetingDay,
        meetingTime: data.meetingTime
      }
    })

    // Crear relaciones con líderes
    await tx.groupLeader.createMany({
      data: data.leaderIds.map(userId => ({
        groupId: created.id,
        userId
      }))
    })

    return tx.group.findUnique({
      where: { id: created.id },
      include: {
        network: { select: { id: true, name: true } },
        leaders: {
          include: {
            user: { select: { id: true, name: true, image: true } }
          }
        },
        _count: { select: { leaders: true } }
      }
    })
  })

  return group
}

export async function updateGroup(
  id: string,
  data: {
    name?: string
    description?: string | null
    imageUrl?: string | null
    isActive?: boolean
    networkId?: string
    modality?: string
    city?: string | null
    address?: string | null
    neighborhood?: string | null
    meetingDay?: string | null
    meetingTime?: string | null
    leaderIds?: string[]
  }
) {
  const session = await requireAdmin()
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organizacion')
  }

  const group = await prisma.group.findUnique({
    where: { id },
    select: { organizationId: true, networkId: true, modality: true }
  })

  if (!group || group.organizationId !== organizationId) {
    throw new Error('Grupo no encontrado o no autorizado')
  }

  const targetNetworkId = data.networkId ?? group.networkId
  const targetModality = data.modality ?? group.modality

  // Si se cambia la red, validar que existe
  if (data.networkId && data.networkId !== group.networkId) {
    const network = await prisma.network.findUnique({
      where: { id: data.networkId },
      select: { organizationId: true }
    })

    if (!network || network.organizationId !== organizationId) {
      throw new Error('Red no encontrada o no autorizada')
    }
  }

  // Validar líderes si se actualizan
  if (data.leaderIds !== undefined) {
    if (data.leaderIds.length === 0) {
      throw new Error('Debe haber al menos un lider en el grupo')
    }

    const leaders = await prisma.user.findMany({
      where: {
        id: { in: data.leaderIds },
        networkId: targetNetworkId
      },
      select: { id: true }
    })

    if (leaders.length !== data.leaderIds.length) {
      throw new Error('Algunos lideres no pertenecen a la red seleccionada')
    }
  }

  // Validar ubicación si es presencial
  if (targetModality === 'presencial') {
    const city = data.city !== undefined ? data.city : (await prisma.group.findUnique({ where: { id }, select: { city: true } }))?.city

    if (!city?.trim()) {
      throw new Error('Para grupos presenciales, el municipio/ciudad es requerido')
    }
  }

  // Actualizar en transacción
  return prisma.$transaction(async tx => {
    const updateData: Record<string, unknown> = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl
    if (data.isActive !== undefined) updateData.isActive = data.isActive
    if (data.networkId !== undefined) updateData.networkId = data.networkId
    if (data.modality !== undefined) updateData.modality = data.modality
    if (data.meetingDay !== undefined) updateData.meetingDay = data.meetingDay
    if (data.meetingTime !== undefined) updateData.meetingTime = data.meetingTime

    // Campos de ubicación según modalidad
    if (targetModality === 'presencial') {
      if (data.city !== undefined) updateData.city = data.city
      if (data.address !== undefined) updateData.address = data.address
      if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood
    } else if (data.modality === 'virtual') {
      // Limpiar campos de ubicación si cambia a virtual
      updateData.city = null
      updateData.address = null
      updateData.neighborhood = null
    }

    await tx.group.update({
      where: { id },
      data: updateData
    })

    // Si se actualizan líderes
    if (data.leaderIds !== undefined) {
      // Eliminar líderes actuales
      await tx.groupLeader.deleteMany({
        where: { groupId: id }
      })

      // Crear nuevos líderes
      await tx.groupLeader.createMany({
        data: data.leaderIds.map(userId => ({
          groupId: id,
          userId
        }))
      })
    }

    return tx.group.findUnique({
      where: { id },
      include: {
        network: { select: { id: true, name: true } },
        leaders: {
          include: {
            user: { select: { id: true, name: true, image: true } }
          }
        },
        _count: { select: { leaders: true } }
      }
    })
  })
}

export async function deleteGroup(id: string) {
  const session = await requireAdmin()
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organizacion')
  }

  const group = await prisma.group.findUnique({
    where: { id },
    select: { organizationId: true, name: true }
  })

  if (!group || group.organizationId !== organizationId) {
    throw new Error('Grupo no encontrado o no autorizado')
  }

  // Los líderes se eliminan automáticamente por onDelete: Cascade
  await prisma.group.delete({ where: { id } })

  return { success: true, name: group.name }
}

// Helper para obtener redes con sus miembros (para selectores)
export async function getNetworksForGroups(): Promise<NetworkOption[]> {
  const session = await requireAdmin()
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organizacion')
  }

  const networks = await prisma.network.findMany({
    where: {
      organizationId,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      users: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true,
          email: true
        },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
      }
    },
    orderBy: { name: 'asc' }
  })

  return networks
}
