'use server'

import { getServerSession } from 'next-auth'

import prisma from '@/libs/prisma'
import { authOptions } from '@/libs/auth'

async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    throw new Error('No autorizado: se requiere rol de administrador')
  }

  return session
}

async function getAdminOrganizationId(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true }
  })

  return user?.organizationId || null
}

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
  const session = await requireAdmin()
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
  const session = await requireAdmin()
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
  const session = await requireAdmin()
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
  const session = await requireAdmin()
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
  const session = await requireAdmin()
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

// Helper para obtener usuarios disponibles (para selectores)
// Ahora excluye usuarios que ya están en otra red
export async function getOrganizationUsers(excludeNetworkId?: string) {
  const session = await requireAdmin()
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
