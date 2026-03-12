'use server'

import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'

import prisma from '@/libs/prisma'
import { authOptions } from '@/libs/auth'

export async function getProfileById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) return null

  const { password: _, ...profile } = user

  return profile
}

/**
 * Obtiene el perfil completo del usuario con red, grupos y estadísticas
 */
export async function getFullProfile(userId: string) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error('No autorizado')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      network: true,
      organization: {
        select: { id: true, name: true, logoUrl: true }
      },
      userRole: {
        select: { id: true, name: true, slug: true, hierarchy: true }
      },
      group: {
        include: {
          network: { select: { id: true, name: true } },
          _count: { select: { reports: true } }
        }
      }
    }
  })

  if (!user) return null

  // Contar reportes creados por el usuario
  const reportsCount = await prisma.groupReport.count({
    where: { reporterId: userId }
  })

  // Obtener total asistentes de sus reportes
  const reportsStats = await prisma.groupReport.aggregate({
    where: { reporterId: userId },
    _sum: { totalAttendees: true, visitorsCount: true },
    _avg: { totalAttendees: true }
  })

  const { password: _, ...profile } = user

  return {
    ...profile,
    stats: {
      reportsCount,
      groupsLeading: user.groupRole === 'leader' && user.groupId ? 1 : 0,
      totalAttendees: reportsStats._sum.totalAttendees || 0,
      totalVisitors: reportsStats._sum.visitorsCount || 0,
      avgAttendees: Math.round(reportsStats._avg.totalAttendees || 0)
    }
  }
}

/**
 * Obtiene un usuario por ID con toda su información (para admin)
 */
export async function getUserFullDetails(userId: string) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user.roleHierarchy ?? 999) > 2) {
    throw new Error('No autorizado')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      network: true,
      organization: {
        select: { id: true, name: true, logoUrl: true }
      },
      userRole: {
        select: { id: true, name: true, slug: true, hierarchy: true }
      },
      group: {
        include: {
          network: { select: { id: true, name: true } },
          members: {
            where: { groupRole: 'leader' },
            select: { id: true, name: true, firstName: true, lastName: true, image: true }
          },
          _count: { select: { reports: true } }
        }
      },
      groupReports: {
        orderBy: { meetingDate: 'desc' },
        take: 10,
        include: {
          group: { select: { id: true, name: true } }
        }
      }
    }
  })

  if (!user) return null

  // Contar reportes creados por el usuario
  const reportsCount = await prisma.groupReport.count({
    where: { reporterId: userId }
  })

  // Obtener estadísticas de reportes
  const reportsStats = await prisma.groupReport.aggregate({
    where: { reporterId: userId },
    _sum: { totalAttendees: true, visitorsCount: true },
    _avg: { totalAttendees: true }
  })

  const { password: _, ...profile } = user

  return {
    ...profile,
    stats: {
      reportsCount,
      groupsLeading: user.groupRole === 'leader' && user.groupId ? 1 : 0,
      totalAttendees: reportsStats._sum.totalAttendees || 0,
      totalVisitors: reportsStats._sum.visitorsCount || 0,
      avgAttendees: Math.round(reportsStats._avg.totalAttendees || 0)
    }
  }
}

/**
 * Obtiene una red con todos sus grupos y estadísticas
 */
export async function getNetworkFullDetails(networkId: string) {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error('No autorizado')
  }

  const network = await prisma.network.findUnique({
    where: { id: networkId },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          phone: true,
          networkRole: true,
          isActive: true,
          createdAt: true
        }
      },
      groups: {
        include: {
          members: {
            where: { groupRole: 'leader' },
            select: { id: true, name: true, firstName: true, lastName: true, image: true, email: true }
          },
          _count: { select: { reports: true } }
        }
      }
    }
  })

  if (!network) return null

  // Obtener estadísticas de reportes de la red en una sola query
  const groupIds = network.groups.map(g => g.id)
  const activeGroups = network.groups.filter(g => g.isActive)

  // Fechas para cálculos
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // Ejecutar queries en paralelo
  const [reportsStats, reportsThisMonth, newMembersThisMonth, newMembersLastMonth] = await Promise.all([
    // Estadísticas generales de reportes
    prisma.groupReport.aggregate({
      where: { groupId: { in: groupIds } },
      _sum: { totalAttendees: true, visitorsCount: true },
      _avg: { totalAttendees: true },
      _count: true
    }),

    // Reportes de este mes (para calcular porcentaje de cumplimiento)
    prisma.groupReport.findMany({
      where: {
        groupId: { in: groupIds },
        meetingDate: { gte: startOfMonth }
      },
      select: { groupId: true }
    }),

    // Miembros nuevos este mes
    prisma.user.count({
      where: {
        networkId: networkId,
        createdAt: { gte: startOfMonth }
      }
    }),

    // Miembros nuevos mes anterior
    prisma.user.count({
      where: {
        networkId: networkId,
        createdAt: { gte: startOfLastMonth, lt: startOfMonth }
      }
    })
  ])

  // Calcular porcentaje de cumplimiento de reportes del mes
  // Asumiendo que cada grupo debe reportar al menos 4 veces al mes (semanal)
  const expectedReportsPerGroup = 4
  const totalExpectedReports = activeGroups.length * expectedReportsPerGroup

  // Contar grupos únicos que reportaron este mes
  const groupsReportedThisMonth = new Set(reportsThisMonth.map(r => r.groupId)).size
  const reportsCountThisMonth = reportsThisMonth.length

  // Porcentaje basado en grupos que reportaron vs grupos activos
  const reportingPercentage = activeGroups.length > 0
    ? Math.round((groupsReportedThisMonth / activeGroups.length) * 100)
    : 0

  // Calcular crecimiento de miembros
  const memberGrowth = newMembersLastMonth > 0
    ? Math.round(((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100)
    : newMembersThisMonth > 0 ? 100 : 0

  // Mapear members → leaders para compatibilidad con el view
  const groupsWithLeaders = network.groups.map(({ members, ...group }) => ({
    ...group,
    leaders: members
  }))

  return {
    ...network,
    groups: groupsWithLeaders,
    stats: {
      totalGroups: network.groups.length,
      activeGroups: activeGroups.length,
      totalLeaders: network.users.filter(u => u.networkRole === 'leader').length,
      totalMembers: network.users.filter(u => u.networkRole === 'member').length,
      totalUsers: network.users.length,
      totalReports: reportsStats._count || 0,
      totalAttendees: reportsStats._sum.totalAttendees || 0,
      totalVisitors: reportsStats._sum.visitorsCount || 0,
      avgAttendees: Math.round(reportsStats._avg.totalAttendees || 0),
      // Nuevas estadísticas
      newMembersThisMonth,
      memberGrowth,
      reportsThisMonth: reportsCountThisMonth,
      groupsReportedThisMonth,
      reportingPercentage
    }
  }
}

export async function updateProfile(
  userId: string,
  data: {
    firstName?: string
    lastName?: string
    phone?: string
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
    image?: string
  }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.id !== userId) {
    throw new Error('No autorizado')
  }

  const name =
    data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : undefined

  const updateData: Record<string, unknown> = { ...data }

  if (name) updateData.name = name

  if (data.birthDate) {
    updateData.birthDate = new Date(data.birthDate)
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData
  })

  const { password: _, ...profile } = user

  return profile
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.id !== userId) {
    throw new Error('No autorizado')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user || !user.password) {
    throw new Error('Usuario no encontrado o no tiene contraseña configurada')
  }

  const isValid = await bcrypt.compare(currentPassword, user.password)

  if (!isValid) {
    throw new Error('La contraseña actual es incorrecta')
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })

  return { success: true }
}
