'use server'

import prisma from '@/libs/prisma'
import { requireAuth, getUserOrganizationId } from './helpers'
import { getActiveVacationPeriod } from './reportActions'

export type DashboardStats = {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  totalNetworks: number
  activeNetworks: number
  totalGroups: number
  activeGroups: number
  totalAdmins: number
  usersWithNetwork: number
  usersWithoutNetwork: number
  newUsersThisMonth: number
  newUsersLastMonth: number
  topNetworks: Array<{
    id: string
    name: string
    memberCount: number
    leaderCount: number
    imageUrl: string | null
  }>
  recentUsers: Array<{
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    image: string | null
    createdAt: Date
  }>
  upcomingGroups: Array<{
    id: string
    name: string
    imageUrl: string | null
    meetingDay: string | null
    meetingTime: string | null
    modality: string
    networkName: string
    leaderNames: string[]
  }>
  upcomingEvents: Array<{
    id: string
    title: string
    description: string | null
    startDate: Date
    endDate: Date
    allDay: boolean
    category: string
    location: string | null
  }>
  currentUserName: string
  // Weekly reporting progress
  reportingProgress: {
    expected: number
    reported: number
    unreportedGroups: Array<{
      id: string
      name: string
      meetingDay: string
      networkName: string
    }>
  }
  isVacationPeriod: boolean
  vacationPeriodName: string | null
}

// Mapeo de días de la semana a números (0 = domingo, 1 = lunes, etc.)
const DAY_ORDER: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const session = await requireAuth()

  const [organizationId, currentUser] = await Promise.all([
    getUserOrganizationId(session.user.id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, firstName: true }
    })
  ])

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const currentUserName = currentUser?.firstName || currentUser?.name?.split(' ')[0] || 'Usuario'

  // Obtener fecha del inicio del mes actual y del mes anterior
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // Ejecutar todas las queries en paralelo
  const [
    totalUsers,
    activeUsers,
    totalAdmins,
    usersWithNetwork,
    totalNetworks,
    activeNetworks,
    totalGroups,
    activeGroups,
    newUsersThisMonth,
    newUsersLastMonth,
    topNetworks,
    recentUsers,
    allGroups,
    upcomingCalendarEvents
  ] = await Promise.all([
    // Total de usuarios
    prisma.user.count({
      where: { organizationId }
    }),

    // Usuarios activos
    prisma.user.count({
      where: { organizationId, isActive: true }
    }),

    // Total de admins (hierarchy <= 2)
    prisma.user.count({
      where: { organizationId, userRole: { hierarchy: { lte: 2 } } }
    }),

    // Usuarios con red asignada
    prisma.user.count({
      where: { organizationId, networkId: { not: null } }
    }),

    // Total de redes
    prisma.network.count({
      where: { organizationId }
    }),

    // Redes activas
    prisma.network.count({
      where: { organizationId, isActive: true }
    }),

    // Total de grupos
    prisma.group.count({
      where: { organizationId }
    }),

    // Grupos activos
    prisma.group.count({
      where: { organizationId, isActive: true }
    }),

    // Nuevos usuarios este mes
    prisma.user.count({
      where: {
        organizationId,
        createdAt: { gte: startOfMonth }
      }
    }),

    // Nuevos usuarios mes anterior
    prisma.user.count({
      where: {
        organizationId,
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfMonth
        }
      }
    }),

    // Top 5 redes con más miembros
    prisma.network.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        users: {
          select: { networkRole: true }
        }
      },
      orderBy: {
        users: { _count: 'desc' }
      },
      take: 5
    }),

    // 5 usuarios más recientes
    prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        image: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),

    // Grupos con horario de reunión
    prisma.group.findMany({
      where: {
        organizationId,
        isActive: true,
        meetingDay: { not: null }
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        meetingDay: true,
        meetingTime: true,
        modality: true,
        network: {
          select: { name: true }
        },
        members: {
          where: { groupRole: 'leader' },
          select: { name: true, firstName: true, lastName: true },
          take: 2
        }
      }
    }),

    // Próximos eventos del calendario (próximos 30 días)
    prisma.calendarEvent.findMany({
      where: {
        organizationId,
        isActive: true,
        startDate: {
          gte: now,
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
        allDay: true,
        category: true,
        location: true
      },
      orderBy: { startDate: 'asc' },
      take: 5
    })
  ])

  // Procesar top redes para contar líderes y miembros
  const processedTopNetworks = topNetworks.map(network => ({
    id: network.id,
    name: network.name,
    imageUrl: network.imageUrl,
    memberCount: network.users.filter(u => u.networkRole === 'member').length,
    leaderCount: network.users.filter(u => u.networkRole === 'leader').length
  }))

  // Ordenar grupos por próximo día de reunión
  const today = new Date().getDay() // 0-6 (domingo-sabado)
  const sortedGroups = allGroups
    .map(group => {
      const dayNum = DAY_ORDER[group.meetingDay || ''] ?? 7
      // Calcular días hasta la próxima reunión
      let daysUntil = dayNum - today

      if (daysUntil < 0) daysUntil += 7 // Si ya pasó esta semana, es la próxima

      return { ...group, daysUntil }
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5)

  const upcomingGroups = sortedGroups.map(group => ({
    id: group.id,
    name: group.name,
    imageUrl: group.imageUrl,
    meetingDay: group.meetingDay,
    meetingTime: group.meetingTime,
    modality: group.modality,
    networkName: group.network.name,
    leaderNames: group.members.map(u => {
      return u.firstName || u.name?.split(' ')[0] || 'Lider'
    })
  }))

  // Weekly reporting progress
  const activeVacation = await getActiveVacationPeriod(organizationId)
  let reportingProgress = { expected: 0, reported: 0, unreportedGroups: [] as Array<{ id: string; name: string; meetingDay: string; networkName: string }> }

  if (!activeVacation) {
    const todayDate = new Date()

    todayDate.setHours(0, 0, 0, 0)

    const todayDay = todayDate.getDay()

    // Calcular (group, expectedDate) en memoria — sin queries
    const groupDates: Array<{ group: typeof allGroups[0]; expectedDate: Date }> = []

    for (const group of allGroups) {
      if (!group.meetingDay) continue

      const dayNum = DAY_ORDER[group.meetingDay.toLowerCase()] ?? -1

      if (dayNum === -1) continue

      const monday = new Date(todayDate)

      monday.setDate(todayDate.getDate() - ((todayDay + 6) % 7))

      const offset = dayNum === 0 ? 6 : dayNum - 1
      const expectedDate = new Date(monday)

      expectedDate.setDate(monday.getDate() + offset)

      if (expectedDate > todayDate) continue

      groupDates.push({ group, expectedDate })
    }

    if (groupDates.length > 0) {
      // Una sola query para todos los grupos
      const groupIds = groupDates.map(gd => gd.group.id)
      const dates = groupDates.map(gd => gd.expectedDate)
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))

      const existingReports = await prisma.groupReport.findMany({
        where: {
          groupId: { in: groupIds },
          meetingDate: { gte: minDate, lte: maxDate }
        },
        select: { groupId: true, meetingDate: true }
      })

      // Set de lookup: "groupId_YYYY-M-D" (sin padding, coincide con getFullYear/getMonth/getDate)
      const reportedSet = new Set(
        existingReports.map(r => {
          const d = new Date(r.meetingDate)

          return `${r.groupId}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
        })
      )

      for (const { group, expectedDate } of groupDates) {
        const key = `${group.id}_${expectedDate.getFullYear()}-${expectedDate.getMonth()}-${expectedDate.getDate()}`

        if (reportedSet.has(key)) {
          reportingProgress.reported++
        } else {
          reportingProgress.unreportedGroups.push({
            id: group.id,
            name: group.name,
            meetingDay: group.meetingDay!,
            networkName: group.network.name
          })
        }

        reportingProgress.expected++
      }
    }
  }

  return {
    totalUsers,
    activeUsers,
    inactiveUsers: totalUsers - activeUsers,
    totalNetworks,
    activeNetworks,
    totalGroups,
    activeGroups,
    totalAdmins,
    usersWithNetwork,
    usersWithoutNetwork: totalUsers - usersWithNetwork,
    newUsersThisMonth,
    newUsersLastMonth,
    topNetworks: processedTopNetworks,
    recentUsers,
    upcomingGroups,
    upcomingEvents: upcomingCalendarEvents,
    currentUserName,
    reportingProgress,
    isVacationPeriod: !!activeVacation,
    vacationPeriodName: activeVacation?.name || null
  }
}
