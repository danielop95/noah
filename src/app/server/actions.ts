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
      groupLeaderships: {
        include: {
          group: {
            include: {
              network: { select: { id: true, name: true } },
              _count: { select: { reports: true } }
            }
          }
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
      groupsLeading: user.groupLeaderships.length,
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

  if (!session || session.user.role !== 'admin') {
    throw new Error('No autorizado')
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      network: true,
      organization: {
        select: { id: true, name: true, logoUrl: true }
      },
      groupLeaderships: {
        include: {
          group: {
            include: {
              network: { select: { id: true, name: true } },
              leaders: {
                include: {
                  user: {
                    select: { id: true, name: true, firstName: true, lastName: true, image: true }
                  }
                }
              },
              _count: { select: { reports: true } }
            }
          }
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
      groupsLeading: user.groupLeaderships.length,
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
          isActive: true
        }
      },
      groups: {
        include: {
          leaders: {
            include: {
              user: {
                select: { id: true, name: true, firstName: true, lastName: true, image: true }
              }
            }
          },
          _count: { select: { reports: true } }
        }
      }
    }
  })

  if (!network) return null

  // Obtener estadísticas de reportes de la red
  const groupIds = network.groups.map(g => g.id)

  const reportsStats = await prisma.groupReport.aggregate({
    where: { groupId: { in: groupIds } },
    _sum: { totalAttendees: true, visitorsCount: true },
    _count: true
  })

  const reportsAvg = await prisma.groupReport.aggregate({
    where: { groupId: { in: groupIds } },
    _avg: { totalAttendees: true }
  })

  return {
    ...network,
    stats: {
      totalGroups: network.groups.length,
      totalLeaders: network.users.filter(u => u.networkRole === 'leader').length,
      totalMembers: network.users.filter(u => u.networkRole === 'member').length,
      totalReports: reportsStats._count || 0,
      totalAttendees: reportsStats._sum.totalAttendees || 0,
      totalVisitors: reportsStats._sum.visitorsCount || 0,
      avgAttendees: Math.round(reportsAvg._avg.totalAttendees || 0)
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
