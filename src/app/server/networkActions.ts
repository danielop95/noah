'use server'

import prisma from '@/libs/prisma'
import { requirePermission, getAdminOrganizationId } from './helpers'

// Tipos para las respuestas
export type NetworkUser = {
  id: string
  name: string | null
  firstName: string | null
  lastName: string | null
  image: string | null
  email: string | null
  networkRole: string | null
}

export type NetworkWithUsers = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  organizationId: string
  users: NetworkUser[]
  _count: { users: number }
}

export async function getAllNetworks(): Promise<NetworkWithUsers[]> {
  const session = await requirePermission('redes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organizacion')
  }

  const networks = await prisma.network.findMany({
    where: { organizationId },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true,
          email: true,
          networkRole: true
        }
      },
      _count: {
        select: { users: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return networks as NetworkWithUsers[]
}

export async function getNetworkById(id: string) {
  const session = await requirePermission('redes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organizacion')
  }

  const network = await prisma.network.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true,
          email: true,
          phone: true,
          networkRole: true
        }
      }
    }
  })

  if (!network || network.organizationId !== organizationId) {
    throw new Error('Red no encontrada o no autorizado')
  }

  return network
}

export async function createNetwork(data: {
  name: string
  description?: string
  imageUrl?: string
  leaderIds: string[]
  memberIds: string[]
}) {
  const session = await requirePermission('redes', 'crear')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organizacion')
  }

  // Validar que hay al menos un lider
  if (data.leaderIds.length === 0) {
    throw new Error('Debe haber al menos un lider en la red')
  }

  // Validar que no haya usuarios en ambas listas
  const overlap = data.leaderIds.filter(id => data.memberIds.includes(id))

  if (overlap.length > 0) {
    throw new Error('Un usuario no puede ser lider y miembro de la misma red')
  }

  const allUserIds = [...data.leaderIds, ...data.memberIds]

  // Validar que los usuarios pertenecen a la organizacion y no están ya en otra red
  const users = await prisma.user.findMany({
    where: {
      id: { in: allUserIds },
      organizationId
    },
    select: { id: true, networkId: true, name: true }
  })

  const validUserIds = new Set(users.map(u => u.id))
  const invalidUsers = allUserIds.filter(id => !validUserIds.has(id))

  if (invalidUsers.length > 0) {
    throw new Error('Algunos usuarios no pertenecen a la organizacion')
  }

  // Verificar que ningún usuario ya esté en otra red
  const usersInOtherNetwork = users.filter(u => u.networkId !== null)

  if (usersInOtherNetwork.length > 0) {
    const names = usersInOtherNetwork.map(u => u.name).join(', ')

    throw new Error(`Los siguientes usuarios ya pertenecen a otra red: ${names}`)
  }

  // Crear red y asignar usuarios en transacción
  const network = await prisma.$transaction(async tx => {
    const created = await tx.network.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        organizationId
      }
    })

    // Asignar líderes
    await tx.user.updateMany({
      where: { id: { in: data.leaderIds } },
      data: { networkId: created.id, networkRole: 'leader' }
    })

    // Asignar miembros
    if (data.memberIds.length > 0) {
      await tx.user.updateMany({
        where: { id: { in: data.memberIds } },
        data: { networkId: created.id, networkRole: 'member' }
      })
    }

    return tx.network.findUnique({
      where: { id: created.id },
      include: {
        users: {
          select: { id: true, name: true, image: true, networkRole: true }
        },
        _count: { select: { users: true } }
      }
    })
  })

  return network
}

export async function updateNetwork(
  id: string,
  data: {
    name?: string
    description?: string | null
    imageUrl?: string | null
    isActive?: boolean
    leaderIds?: string[]
    memberIds?: string[]
  }
) {
  const session = await requirePermission('redes', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organizacion')
  }

  const network = await prisma.network.findUnique({
    where: { id },
    select: { organizationId: true }
  })

  if (!network || network.organizationId !== organizationId) {
    throw new Error('Red no encontrada o no autorizado')
  }

  // Validaciones si se actualizan lideres o miembros
  if (data.leaderIds !== undefined || data.memberIds !== undefined) {
    const leaderIds = data.leaderIds ?? []
    const memberIds = data.memberIds ?? []

    // Validar que hay al menos un lider
    if (data.leaderIds !== undefined && leaderIds.length === 0) {
      throw new Error('Debe haber al menos un lider en la red')
    }

    // Validar que no haya usuarios en ambas listas
    const overlap = leaderIds.filter(lid => memberIds.includes(lid))

    if (overlap.length > 0) {
      throw new Error('Un usuario no puede ser lider y miembro de la misma red')
    }

    const allUserIds = [...leaderIds, ...memberIds]

    if (allUserIds.length > 0) {
      const users = await prisma.user.findMany({
        where: {
          id: { in: allUserIds },
          organizationId
        },
        select: { id: true, networkId: true, name: true }
      })

      const validUserIds = new Set(users.map(u => u.id))
      const invalidUsers = allUserIds.filter(uid => !validUserIds.has(uid))

      if (invalidUsers.length > 0) {
        throw new Error('Algunos usuarios no pertenecen a la organizacion')
      }

      // Verificar usuarios en OTRA red (no esta)
      const usersInOtherNetwork = users.filter(u => u.networkId !== null && u.networkId !== id)

      if (usersInOtherNetwork.length > 0) {
        const names = usersInOtherNetwork.map(u => u.name).join(', ')

        throw new Error(`Los siguientes usuarios ya pertenecen a otra red: ${names}`)
      }
    }
  }

  // Actualizar en transacción
  return prisma.$transaction(async tx => {
    // Preparar datos básicos
    const updateData: Record<string, unknown> = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl
    if (data.isActive !== undefined) updateData.isActive = data.isActive

    // Actualizar red
    await tx.network.update({
      where: { id },
      data: updateData
    })

    // Si se actualizan miembros/líderes
    if (data.leaderIds !== undefined || data.memberIds !== undefined) {
      // Quitar todos los usuarios actuales de esta red
      await tx.user.updateMany({
        where: { networkId: id },
        data: { networkId: null, networkRole: null }
      })

      // Asignar nuevos líderes
      if (data.leaderIds && data.leaderIds.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: data.leaderIds } },
          data: { networkId: id, networkRole: 'leader' }
        })
      }

      // Asignar nuevos miembros
      if (data.memberIds && data.memberIds.length > 0) {
        await tx.user.updateMany({
          where: { id: { in: data.memberIds } },
          data: { networkId: id, networkRole: 'member' }
        })
      }
    }

    return tx.network.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, image: true, networkRole: true }
        },
        _count: { select: { users: true } }
      }
    })
  })
}

export async function deleteNetwork(id: string) {
  const session = await requirePermission('redes', 'eliminar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organizacion')
  }

  const network = await prisma.network.findUnique({
    where: { id },
    select: { organizationId: true, name: true }
  })

  if (!network || network.organizationId !== organizationId) {
    throw new Error('Red no encontrada o no autorizado')
  }

  // Los usuarios se desasignan automáticamente por onDelete: SetNull
  await prisma.network.delete({ where: { id } })

  return { success: true, name: network.name }
}

// ============================================
// GRANULAR USER MANAGEMENT
// ============================================

export async function addUserToNetwork(networkId: string, userId: string, role: 'leader' | 'member') {
  const session = await requirePermission('redes', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  // Validate network
  const network = await prisma.network.findUnique({
    where: { id: networkId },
    select: { organizationId: true }
  })

  if (!network || network.organizationId !== organizationId) {
    throw new Error('Red no encontrada')
  }

  // Validate user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, networkId: true, name: true }
  })

  if (!user || user.organizationId !== organizationId) {
    throw new Error('Usuario no encontrado')
  }

  if (user.networkId && user.networkId !== networkId) {
    throw new Error(`${user.name || 'El usuario'} ya pertenece a otra red`)
  }

  if (user.networkId === networkId) {
    throw new Error(`${user.name || 'El usuario'} ya pertenece a esta red`)
  }

  await prisma.user.update({
    where: { id: userId },
    data: { networkId, networkRole: role }
  })

  return { success: true }
}

export async function removeUserFromNetwork(userId: string) {
  const session = await requirePermission('redes', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, networkId: true, groupId: true }
  })

  if (!user || user.organizationId !== organizationId) {
    throw new Error('Usuario no encontrado')
  }

  // Also remove from group if they have one (group requires network membership)
  await prisma.user.update({
    where: { id: userId },
    data: { networkId: null, networkRole: null, groupId: null, groupRole: null }
  })

  return { success: true }
}

export async function changeNetworkRole(userId: string, newRole: 'leader' | 'member') {
  const session = await requirePermission('redes', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, networkId: true }
  })

  if (!user || user.organizationId !== organizationId || !user.networkId) {
    throw new Error('Usuario no encontrado o no pertenece a una red')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { networkRole: newRole }
  })

  return { success: true }
}

export async function getAvailableUsersForNetwork(networkId: string) {
  const session = await requirePermission('redes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  return prisma.user.findMany({
    where: {
      organizationId,
      isActive: true,
      networkId: null
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      image: true,
      email: true
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }, { name: 'asc' }]
  })
}

// Helper para obtener usuarios disponibles (para selectores)
// Ahora excluye usuarios que ya están en otra red
export async function getOrganizationUsers(excludeNetworkId?: string) {
  const session = await requirePermission('redes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organizacion')
  }

  const users = await prisma.user.findMany({
    where: {
      organizationId,
      isActive: true,
      OR: [
        { networkId: null },
        ...(excludeNetworkId ? [{ networkId: excludeNetworkId }] : [])
      ]
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      image: true,
      email: true,
      networkId: true,
      networkRole: true
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }, { name: 'asc' }]
  })

  return users
}

/** Lightweight list of networks for select dropdowns */
export async function getNetworksForSelect() {
  const session = await requirePermission('redes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  return prisma.network.findMany({
    where: { organizationId, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })
}
