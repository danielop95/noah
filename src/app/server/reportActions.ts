'use server'

import prisma from '@/libs/prisma'
import { getSessionUser, getUserOrganizationId, isUserGroupLeader } from './helpers'

// ============================================
// TYPES
// ============================================

export type ReportWithDetails = {
  id: string
  meetingDate: Date
  totalAttendees: number
  leadersCount: number
  visitorsCount: number
  reportOffering: boolean
  offeringAmount: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  groupId: string
  reporterId: string
  group: {
    id: string
    name: string
    imageUrl: string | null
    network: { id: string; name: string }
  }
  reporter: {
    id: string
    name: string | null
    firstName: string | null
    lastName: string | null
    image: string | null
  }
}

export type ReportStats = {
  totalReports: number
  totalAttendees: number
  totalLeaders: number
  totalVisitors: number
  totalOffering: number
  averageAttendees: number
}

export type GroupOptionForReports = {
  id: string
  name: string
  imageUrl: string | null
  networkId: string
  network: { id: string; name: string }
}

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Get all reports - Admin sees all, leaders see only their reports
 */
export async function getAllReports(filters?: {
  groupId?: string
  networkId?: string
  startDate?: string
  endDate?: string
}): Promise<ReportWithDetails[]> {
  const user = await getSessionUser()
  const organizationId = await getUserOrganizationId(user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const hasFullAccess = user.permissions?.includes('reportes.ver') && (user.roleHierarchy ?? 999) <= 2

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { organizationId }

  // Non-admin users see reports from their group (if leader)
  if (!hasFullAccess) {
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { groupId: true, groupRole: true }
    })

    if (currentUser?.groupId && currentUser.groupRole === 'leader') {
      where.groupId = currentUser.groupId
    } else {
      // No es líder de ningún grupo, no ve reportes
      return []
    }
  }

  // Apply filters
  if (filters?.groupId) {
    where.groupId = filters.groupId
  }

  if (filters?.networkId) {
    where.group = { networkId: filters.networkId }
  }

  if (filters?.startDate || filters?.endDate) {
    where.meetingDate = {}

    if (filters.startDate) {
      where.meetingDate.gte = new Date(filters.startDate)
    }

    if (filters.endDate) {
      where.meetingDate.lte = new Date(filters.endDate)
    }
  }

  const reports = await prisma.groupReport.findMany({
    where,
    include: {
      group: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          network: { select: { id: true, name: true } }
        }
      },
      reporter: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          image: true
        }
      }
    },
    orderBy: { meetingDate: 'desc' }
  })

  // Convert Decimal to number for serialization
  return reports.map(report => ({
    ...report,
    offeringAmount: report.offeringAmount ? Number(report.offeringAmount) : null
  })) as ReportWithDetails[]
}

/**
 * Get report by ID with permission check
 */
export async function getReportById(id: string): Promise<ReportWithDetails | null> {
  const user = await getSessionUser()
  const organizationId = await getUserOrganizationId(user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const report = await prisma.groupReport.findUnique({
    where: { id },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          network: { select: { id: true, name: true } }
        }
      },
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
  })

  if (!report || report.organizationId !== organizationId) {
    throw new Error('Reporte no encontrado o no autorizado')
  }

  // Permission check: admin/auxiliar or leader of the group
  const hasFullAccess = (user.roleHierarchy ?? 999) <= 2

  if (!hasFullAccess) {
    const isLeader = await isUserGroupLeader(user.id, report.groupId)

    if (!isLeader) {
      throw new Error('No autorizado para ver este reporte')
    }
  }

  return {
    ...report,
    offeringAmount: report.offeringAmount ? Number(report.offeringAmount) : null
  } as ReportWithDetails
}

/**
 * Get statistics for reports (filtered)
 */
export async function getReportStats(filters?: {
  groupId?: string
  networkId?: string
  startDate?: string
  endDate?: string
}): Promise<ReportStats> {
  const user = await getSessionUser()
  const organizationId = await getUserOrganizationId(user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const hasFullAccess = user.permissions?.includes('reportes.ver') && (user.roleHierarchy ?? 999) <= 2

  // Build where clause (same as getAllReports)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { organizationId }

  if (!hasFullAccess) {
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { groupId: true, groupRole: true }
    })

    if (currentUser?.groupId && currentUser.groupRole === 'leader') {
      where.groupId = currentUser.groupId
    } else {
      return {
        totalReports: 0, totalAttendees: 0, totalLeaders: 0,
        totalVisitors: 0, totalOffering: 0, averageAttendees: 0
      }
    }
  }

  if (filters?.groupId) {
    where.groupId = filters.groupId
  }

  if (filters?.networkId) {
    where.group = { networkId: filters.networkId }
  }

  if (filters?.startDate || filters?.endDate) {
    where.meetingDate = {}

    if (filters.startDate) {
      where.meetingDate.gte = new Date(filters.startDate)
    }

    if (filters.endDate) {
      where.meetingDate.lte = new Date(filters.endDate)
    }
  }

  const aggregate = await prisma.groupReport.aggregate({
    where,
    _count: { id: true },
    _sum: {
      totalAttendees: true,
      leadersCount: true,
      visitorsCount: true,
      offeringAmount: true
    },
    _avg: {
      totalAttendees: true
    }
  })

  return {
    totalReports: aggregate._count.id,
    totalAttendees: aggregate._sum.totalAttendees || 0,
    totalLeaders: aggregate._sum.leadersCount || 0,
    totalVisitors: aggregate._sum.visitorsCount || 0,
    totalOffering: Number(aggregate._sum.offeringAmount || 0),
    averageAttendees: Math.round(aggregate._avg.totalAttendees || 0)
  }
}

/**
 * Get groups where user is leader (for dropdown)
 */
export async function getGroupsForReporting(): Promise<GroupOptionForReports[]> {
  const user = await getSessionUser()
  const organizationId = await getUserOrganizationId(user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const hasFullAccess = (user.roleHierarchy ?? 999) <= 2

  if (hasFullAccess) {
    // Admin/auxiliar can see all active groups
    const groups = await prisma.group.findMany({
      where: { organizationId, isActive: true },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        networkId: true,
        network: { select: { id: true, name: true } }
      },
      orderBy: { name: 'asc' }
    })

    return groups
  }

  // For leaders, only return their group
  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { groupId: true, groupRole: true }
  })

  if (!currentUser?.groupId || currentUser.groupRole !== 'leader') {
    return []
  }

  const group = await prisma.group.findUnique({
    where: { id: currentUser.groupId },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      networkId: true,
      isActive: true,
      network: { select: { id: true, name: true } }
    }
  })

  if (!group || !group.isActive) return []

  return [{
    id: group.id,
    name: group.name,
    imageUrl: group.imageUrl,
    networkId: group.networkId,
    network: group.network
  }]
}

/**
 * Get networks for filtering (admin only)
 */
export async function getNetworksForReportFilters() {
  const user = await getSessionUser()

  if ((user.roleHierarchy ?? 999) > 2) {
    return []
  }

  const organizationId = await getUserOrganizationId(user.id)

  if (!organizationId) {
    return []
  }

  return prisma.network.findMany({
    where: { organizationId, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })
}

// ============================================
// WRITE OPERATIONS
// ============================================

/**
 * Create a new report - only leaders can create for THEIR groups
 */
export async function createReport(data: {
  groupId: string
  meetingDate: string // ISO date string
  totalAttendees: number
  leadersCount: number
  visitorsCount: number
  reportOffering: boolean
  offeringAmount?: number
  notes?: string
}) {
  const user = await getSessionUser()
  const organizationId = await getUserOrganizationId(user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  // Verify user is a leader of this group (or admin)
  const isLeader = await isUserGroupLeader(user.id, data.groupId)

  if (!isLeader && (user.roleHierarchy ?? 999) > 2) {
    throw new Error('Solo los líderes pueden crear reportes para sus grupos')
  }

  // Verify group belongs to organization
  const group = await prisma.group.findUnique({
    where: { id: data.groupId },
    select: { organizationId: true, name: true }
  })

  if (!group || group.organizationId !== organizationId) {
    throw new Error('Grupo no encontrado o no autorizado')
  }

  // Validate data
  if (data.totalAttendees < 1) {
    throw new Error('El total de asistentes debe ser al menos 1')
  }

  if (data.leadersCount < 0 || data.leadersCount > data.totalAttendees) {
    throw new Error('El número de líderes no puede ser mayor al total de asistentes')
  }

  if (data.visitorsCount < 0 || data.visitorsCount > data.totalAttendees) {
    throw new Error('El número de visitas no puede ser mayor al total de asistentes')
  }

  if (data.reportOffering && (data.offeringAmount === undefined || data.offeringAmount < 0)) {
    throw new Error('Si reporta ofrenda, debe indicar un monto válido')
  }

  // Parse date (only date, no time)
  const meetingDate = new Date(data.meetingDate)

  meetingDate.setHours(0, 0, 0, 0)

  // Check for existing report on same date
  const existing = await prisma.groupReport.findUnique({
    where: { groupId_meetingDate: { groupId: data.groupId, meetingDate } }
  })

  if (existing) {
    throw new Error('Ya existe un reporte para este grupo en esta fecha')
  }

  const report = await prisma.groupReport.create({
    data: {
      groupId: data.groupId,
      reporterId: user.id,
      organizationId,
      meetingDate,
      totalAttendees: data.totalAttendees,
      leadersCount: data.leadersCount,
      visitorsCount: data.visitorsCount,
      reportOffering: data.reportOffering,
      offeringAmount: data.reportOffering ? data.offeringAmount : null,
      notes: data.notes || null
    },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          network: { select: { id: true, name: true } }
        }
      },
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
  })

  return {
    ...report,
    offeringAmount: report.offeringAmount ? Number(report.offeringAmount) : null
  }
}

/**
 * Update a report - only the creator can edit
 */
export async function updateReport(
  id: string,
  data: {
    meetingDate?: string
    totalAttendees?: number
    leadersCount?: number
    visitorsCount?: number
    reportOffering?: boolean
    offeringAmount?: number | null
    notes?: string | null
  }
) {
  const user = await getSessionUser()
  const organizationId = await getUserOrganizationId(user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const report = await prisma.groupReport.findUnique({
    where: { id },
    select: {
      reporterId: true,
      organizationId: true,
      groupId: true,
      totalAttendees: true
    }
  })

  if (!report || report.organizationId !== organizationId) {
    throw new Error('Reporte no encontrado o no autorizado')
  }

  // Admin/auxiliar or leader of the group can edit
  const hasFullAccess = (user.roleHierarchy ?? 999) <= 2

  if (!hasFullAccess) {
    const isLeader = await isUserGroupLeader(user.id, report.groupId)

    if (!isLeader) {
      throw new Error('Solo los líderes del grupo o administradores pueden editar este reporte')
    }
  }

  // Build update data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {}

  if (data.meetingDate !== undefined) {
    const newDate = new Date(data.meetingDate)

    newDate.setHours(0, 0, 0, 0)

    // Check for duplicate
    const existing = await prisma.groupReport.findFirst({
      where: {
        groupId: report.groupId,
        meetingDate: newDate,
        NOT: { id }
      }
    })

    if (existing) {
      throw new Error('Ya existe un reporte para este grupo en esta fecha')
    }

    updateData.meetingDate = newDate
  }

  const totalAttendees = data.totalAttendees ?? report.totalAttendees

  if (data.totalAttendees !== undefined) {
    if (data.totalAttendees < 1) {
      throw new Error('El total de asistentes debe ser al menos 1')
    }

    updateData.totalAttendees = data.totalAttendees
  }

  if (data.leadersCount !== undefined) {
    if (data.leadersCount < 0 || data.leadersCount > totalAttendees) {
      throw new Error('El número de líderes no puede ser mayor al total de asistentes')
    }

    updateData.leadersCount = data.leadersCount
  }

  if (data.visitorsCount !== undefined) {
    if (data.visitorsCount < 0 || data.visitorsCount > totalAttendees) {
      throw new Error('El número de visitas no puede ser mayor al total de asistentes')
    }

    updateData.visitorsCount = data.visitorsCount
  }

  if (data.reportOffering !== undefined) {
    updateData.reportOffering = data.reportOffering

    if (!data.reportOffering) {
      updateData.offeringAmount = null
    }
  }

  if (data.offeringAmount !== undefined) {
    updateData.offeringAmount = data.offeringAmount
  }

  if (data.notes !== undefined) {
    updateData.notes = data.notes
  }

  const updated = await prisma.groupReport.update({
    where: { id },
    data: updateData,
    include: {
      group: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          network: { select: { id: true, name: true } }
        }
      },
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
  })

  return {
    ...updated,
    offeringAmount: updated.offeringAmount ? Number(updated.offeringAmount) : null
  }
}

/**
 * Delete a report - admin or creator
 */
export async function deleteReport(id: string) {
  const user = await getSessionUser()
  const organizationId = await getUserOrganizationId(user.id)

  if (!organizationId) {
    throw new Error('El usuario no pertenece a ninguna organización')
  }

  const report = await prisma.groupReport.findUnique({
    where: { id },
    select: {
      reporterId: true,
      organizationId: true,
      groupId: true,
      group: { select: { name: true } },
      meetingDate: true
    }
  })

  if (!report || report.organizationId !== organizationId) {
    throw new Error('Reporte no encontrado o no autorizado')
  }

  // Admin/auxiliar or leader of the group can delete
  const hasFullAccess = (user.roleHierarchy ?? 999) <= 2

  if (!hasFullAccess) {
    const isLeader = await isUserGroupLeader(user.id, report.groupId)

    if (!isLeader) {
      throw new Error('No autorizado para eliminar este reporte')
    }
  }

  await prisma.groupReport.delete({ where: { id } })

  return {
    success: true,
    groupName: report.group.name,
    date: report.meetingDate
  }
}

/**
 * Check if a report already exists for a group on a specific date
 * Used for real-time validation in the UI
 */
export async function checkReportExists(
  groupId: string,
  meetingDate: string,
  excludeReportId?: string
): Promise<{ exists: boolean; reporterName?: string }> {
  const date = new Date(meetingDate)

  date.setHours(0, 0, 0, 0)

  const existing = await prisma.groupReport.findUnique({
    where: { groupId_meetingDate: { groupId, meetingDate: date } },
    select: {
      id: true,
      reporter: { select: { firstName: true, lastName: true, name: true } }
    }
  })

  if (!existing || (excludeReportId && existing.id === excludeReportId)) {
    return { exists: false }
  }

  const reporter = existing.reporter
  const reporterName = reporter.firstName
    ? `${reporter.firstName} ${reporter.lastName || ''}`.trim()
    : reporter.name || 'otro líder'

  return { exists: true, reporterName }
}
