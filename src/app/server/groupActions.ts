'use server'

import prisma from '@/libs/prisma'
import { requirePermission, getAdminOrganizationId } from './helpers'

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
  leaders: GroupLeaderInfo[]
  _count: { members: number }
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
    groupId: string | null
    groupRole: string | null
  }[]
}

export async function getAllGroups(): Promise<GroupWithDetails[]> {
  const session = await requirePermission('grupos', 'ver')
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
      members: {
        where: { groupRole: 'leader' },
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true,
          email: true
        }
      },
      _count: {
        select: { members: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return groups.map(g => ({
    ...g,
    leaders: g.members
  })) as unknown as GroupWithDetails[]
}

export async function getGroupById(id: string) {
  const session = await requirePermission('grupos', 'ver')
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
      members: {
        where: { groupRole: 'leader' },
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
  })

  if (!group || group.organizationId !== organizationId) {
    throw new Error('Grupo no encontrado o no autorizado')
  }

  return { ...group, leaders: group.members }
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
  const session = await requirePermission('grupos', 'crear')
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
    select: { id: true, name: true, groupId: true }
  })

  if (leaders.length !== data.leaderIds.length) {
    throw new Error('Algunos lideres no pertenecen a la red seleccionada')
  }

  // Validar que ningún líder ya pertenece a otro grupo
  const leadersWithGroup = leaders.filter(l => l.groupId !== null)

  if (leadersWithGroup.length > 0) {
    throw new Error('Algunos lideres ya pertenecen a otro grupo')
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

    // Asignar líderes al grupo
    await tx.user.updateMany({
      where: { id: { in: data.leaderIds } },
      data: { groupId: created.id, groupRole: 'leader' }
    })

    return tx.group.findUnique({
      where: { id: created.id },
      include: {
        network: { select: { id: true, name: true } },
        members: {
          where: { groupRole: 'leader' },
          select: { id: true, name: true, image: true }
        },
        _count: { select: { members: true } }
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
  const session = await requirePermission('grupos', 'editar')
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
      select: { id: true, groupId: true }
    })

    if (leaders.length !== data.leaderIds.length) {
      throw new Error('Algunos lideres no pertenecen a la red seleccionada')
    }

    // Validar que no pertenezcan a OTRO grupo
    const leadersInOtherGroup = leaders.filter(l => l.groupId !== null && l.groupId !== id)

    if (leadersInOtherGroup.length > 0) {
      throw new Error('Algunos lideres ya pertenecen a otro grupo')
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
      // Quitar asignación de líderes actuales de este grupo
      await tx.user.updateMany({
        where: { groupId: id, groupRole: 'leader' },
        data: { groupId: null, groupRole: null }
      })

      // Asignar nuevos líderes
      await tx.user.updateMany({
        where: { id: { in: data.leaderIds } },
        data: { groupId: id, groupRole: 'leader' }
      })
    }

    return tx.group.findUnique({
      where: { id },
      include: {
        network: { select: { id: true, name: true } },
        members: {
          where: { groupRole: 'leader' },
          select: { id: true, name: true, image: true }
        },
        _count: { select: { members: true } }
      }
    })
  })
}

export async function deleteGroup(id: string) {
  const session = await requirePermission('grupos', 'eliminar')
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

  // Los miembros se desasignan automáticamente por onDelete: SetNull
  await prisma.group.delete({ where: { id } })

  return { success: true, name: group.name }
}

// Helper para obtener redes con sus miembros (para selectores)
export async function getNetworksForGroups(): Promise<NetworkOption[]> {
  const session = await requirePermission('grupos', 'ver')
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
          email: true,
          groupId: true,
          groupRole: true
        },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
      }
    },
    orderBy: { name: 'asc' }
  })

  return networks
}

// ============================================
// GRANULAR USER MANAGEMENT
// ============================================

export async function addUserToGroup(groupId: string, userId: string, role: 'leader' | 'member') {
  const session = await requirePermission('grupos', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { organizationId: true, networkId: true }
  })

  if (!group || group.organizationId !== organizationId) {
    throw new Error('Grupo no encontrado')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, networkId: true, groupId: true, name: true }
  })

  if (!user || user.organizationId !== organizationId) {
    throw new Error('Usuario no encontrado')
  }

  if (user.networkId !== group.networkId) {
    throw new Error(`${user.name || 'El usuario'} no pertenece a la red de este grupo`)
  }

  if (user.groupId && user.groupId !== groupId) {
    throw new Error(`${user.name || 'El usuario'} ya pertenece a otro grupo`)
  }

  if (user.groupId === groupId) {
    throw new Error(`${user.name || 'El usuario'} ya pertenece a este grupo`)
  }

  await prisma.user.update({
    where: { id: userId },
    data: { groupId, groupRole: role }
  })

  return { success: true }
}

export async function removeUserFromGroup(userId: string) {
  const session = await requirePermission('grupos', 'editar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, groupId: true }
  })

  if (!user || user.organizationId !== organizationId) {
    throw new Error('Usuario no encontrado')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { groupId: null, groupRole: null }
  })

  return { success: true }
}

export async function getAvailableUsersForGroup(groupId: string) {
  const session = await requirePermission('grupos', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { organizationId: true, networkId: true }
  })

  if (!group || group.organizationId !== organizationId) {
    throw new Error('Grupo no encontrado')
  }

  // Return users in the same network who are NOT already in a group
  return prisma.user.findMany({
    where: {
      organizationId,
      isActive: true,
      networkId: group.networkId,
      OR: [
        { groupId: null },
        { groupId: groupId } // include users already in this group (for role changes)
      ]
    },
    select: {
      id: true,
      name: true,
      firstName: true,
      lastName: true,
      image: true,
      email: true,
      groupId: true,
      groupRole: true
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }, { name: 'asc' }]
  })
}

// ============================================
// DETAIL VIEW - FULL GROUP DATA
// ============================================

export type GroupFullDetails = {
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
  network: {
    id: string
    name: string
    imageUrl: string | null
  }
  leaders: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    image: string | null
    phone: string | null
    isActive: boolean
  }[]
  groupMembers: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    image: string | null
    phone: string | null
    groupRole: string | null
    isActive: boolean
  }[]
  networkMembers: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    image: string | null
    phone: string | null
    networkRole: string | null
    isActive: boolean
  }[]
  stats: {
    totalReports: number
    totalAttendees: number
    totalVisitors: number
    avgAttendees: number
    totalOffering: number
    reportsThisMonth: number
    avgAttendeesThisMonth: number
    lastReportDate: Date | null
    attendeesGrowth: number
  }
  recentReports: {
    id: string
    meetingDate: Date
    totalAttendees: number
    leadersCount: number
    visitorsCount: number
    reportOffering: boolean
    offeringAmount: number | null
    notes: string | null
    createdAt: Date
    reporter: {
      id: string
      name: string | null
      firstName: string | null
      lastName: string | null
      image: string | null
    }
  }[]
}

export async function getGroupFullDetails(groupId: string): Promise<GroupFullDetails | null> {
  const session = await requirePermission('grupos', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) {
    throw new Error('El administrador no pertenece a ninguna organizacion')
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      network: {
        select: { id: true, name: true, imageUrl: true }
      },
      members: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          phone: true,
          groupRole: true,
          isActive: true
        }
      }
    }
  })

  if (!group || group.organizationId !== organizationId) {
    return null
  }

  // Separar líderes y miembros
  const leaders = group.members.filter(m => m.groupRole === 'leader')
  const groupMembers = group.members

  // Calculate date ranges
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // Get statistics in parallel
  const [
    allTimeStats,
    reportsThisMonth,
    reportsLastMonth,
    recentReports,
    lastReport,
    networkMembers
  ] = await Promise.all([
    prisma.groupReport.aggregate({
      where: { groupId },
      _count: { id: true },
      _sum: {
        totalAttendees: true,
        visitorsCount: true,
        offeringAmount: true
      },
      _avg: { totalAttendees: true }
    }),
    prisma.groupReport.aggregate({
      where: { groupId, meetingDate: { gte: startOfMonth } },
      _count: { id: true },
      _avg: { totalAttendees: true }
    }),
    prisma.groupReport.aggregate({
      where: {
        groupId,
        meetingDate: { gte: startOfLastMonth, lt: startOfMonth }
      },
      _avg: { totalAttendees: true }
    }),
    prisma.groupReport.findMany({
      where: { groupId },
      orderBy: { meetingDate: 'desc' },
      take: 10,
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true
          }
        }
      }
    }),
    prisma.groupReport.findFirst({
      where: { groupId },
      orderBy: { meetingDate: 'desc' },
      select: { meetingDate: true }
    }),
    prisma.user.findMany({
      where: { networkId: group.networkId },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        image: true,
        phone: true,
        networkRole: true,
        isActive: true
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
    })
  ])

  // Calculate growth
  const avgThisMonth = reportsThisMonth._avg.totalAttendees || 0
  const avgLastMonth = reportsLastMonth._avg.totalAttendees || 0
  let attendeesGrowth = 0

  if (avgLastMonth > 0) {
    attendeesGrowth = Math.round(((avgThisMonth - avgLastMonth) / avgLastMonth) * 100)
  }

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    imageUrl: group.imageUrl,
    isActive: group.isActive,
    modality: group.modality,
    city: group.city,
    address: group.address,
    neighborhood: group.neighborhood,
    meetingDay: group.meetingDay,
    meetingTime: group.meetingTime,
    createdAt: group.createdAt,
    network: group.network,
    leaders,
    groupMembers,
    networkMembers,
    stats: {
      totalReports: allTimeStats._count.id,
      totalAttendees: allTimeStats._sum.totalAttendees || 0,
      totalVisitors: allTimeStats._sum.visitorsCount || 0,
      avgAttendees: Math.round(allTimeStats._avg.totalAttendees || 0),
      totalOffering: Number(allTimeStats._sum.offeringAmount || 0),
      reportsThisMonth: reportsThisMonth._count.id,
      avgAttendeesThisMonth: Math.round(avgThisMonth),
      lastReportDate: lastReport?.meetingDate || null,
      attendeesGrowth
    },
    recentReports: recentReports.map(r => ({
      ...r,
      offeringAmount: r.offeringAmount ? Number(r.offeringAmount) : null
    }))
  }
}

/** Lightweight list of groups for select dropdowns, optionally filtered by networkId */
export async function getGroupsForSelect(networkId?: string) {
  const session = await requirePermission('grupos', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('No autorizado')

  return prisma.group.findMany({
    where: {
      organizationId,
      isActive: true,
      ...(networkId ? { networkId } : {})
    },
    select: { id: true, name: true, networkId: true },
    orderBy: { name: 'asc' }
  })
}
