import 'server-only'

import { AreaMembershipRole, EstadoSolicitudArea } from '@prisma/client'

import prisma from '@/libs/prisma'

export type EstadoGlobal =
  | 'pendiente'
  | 'enRevision'
  | 'aprobada'
  | 'parcialmenteAprobada'
  | 'rechazada'
  | 'cancelada'
  | 'completada'

export type SolicitudParaEstado = {
  cancelada: boolean
  areas: { estado: EstadoSolicitudArea }[]
  informe: { id: string } | null
}

export function computeEstadoGlobal(s: SolicitudParaEstado): EstadoGlobal {
  if (s.cancelada) return 'cancelada'
  if (s.areas.length === 0) return 'pendiente'

  const total = s.areas.length
  const pendientes = s.areas.filter(a => a.estado === 'PENDIENTE').length
  const aprobadas = s.areas.filter(a => a.estado === 'APROBADA').length
  const rechazadas = s.areas.filter(a => a.estado === 'RECHAZADA').length

  if (rechazadas === total) return 'rechazada'
  if (aprobadas === total) return s.informe ? 'completada' : 'aprobada'
  if (aprobadas > 0 && rechazadas > 0 && pendientes === 0) return 'parcialmenteAprobada'
  if (pendientes < total) return 'enRevision'

  return 'pendiente'
}

export function computeUrgente(fechaEvento: Date, now: Date = new Date()): boolean {
  const ms = fechaEvento.getTime() - now.getTime()
  const days = ms / (1000 * 60 * 60 * 24)

  return days < 15
}

export async function getMyAreaMemberships(userId: string) {
  return prisma.areaMembership.findMany({
    where: { userId },
    select: { areaId: true, role: true }
  })
}

export async function getMyLeaderAreaIds(userId: string): Promise<string[]> {
  const rows = await prisma.areaMembership.findMany({
    where: { userId, role: AreaMembershipRole.LIDER },
    select: { areaId: true }
  })

  return rows.map(r => r.areaId)
}

export async function getMyMemberAreaIds(userId: string): Promise<string[]> {
  const rows = await prisma.areaMembership.findMany({
    where: { userId, role: AreaMembershipRole.MIEMBRO },
    select: { areaId: true }
  })

  return rows.map(r => r.areaId)
}

export async function isLeaderOfAnyArea(userId: string): Promise<boolean> {
  const count = await prisma.areaMembership.count({
    where: { userId, role: AreaMembershipRole.LIDER }
  })

  return count > 0
}

export async function isLeaderOfArea(userId: string, areaId: string): Promise<boolean> {
  const m = await prisma.areaMembership.findUnique({
    where: { areaId_userId: { areaId, userId } },
    select: { role: true }
  })

  return m?.role === AreaMembershipRole.LIDER
}

export function isAdminHierarchy(hierarchy: number | undefined | null): boolean {
  return (hierarchy ?? 999) <= 1
}

export function canEditSolicitud(
  solicitud: { createdById: string; cancelada: boolean; areas: { estado: EstadoSolicitudArea }[] },
  user: { id: string; roleHierarchy?: number | null }
): boolean {
  if (solicitud.cancelada) return false

  const todasPendientes = solicitud.areas.every(a => a.estado === EstadoSolicitudArea.PENDIENTE)

  if (!todasPendientes) return false
  if (isAdminHierarchy(user.roleHierarchy)) return true

  return solicitud.createdById === user.id
}

export function canCancelSolicitud(
  solicitud: SolicitudParaEstado & { createdById: string },
  user: { id: string; roleHierarchy?: number | null }
): boolean {
  const estado = computeEstadoGlobal(solicitud)

  if (estado === 'cancelada' || estado === 'completada') return false
  if (isAdminHierarchy(user.roleHierarchy)) return true

  return solicitud.createdById === user.id
}

export async function canApproveArea(
  solicitudArea: { areaId: string; estado: EstadoSolicitudArea },
  user: { id: string; roleHierarchy?: number | null }
): Promise<boolean> {
  if (solicitudArea.estado !== EstadoSolicitudArea.PENDIENTE) return false
  if (isAdminHierarchy(user.roleHierarchy)) return true

  return isLeaderOfArea(user.id, solicitudArea.areaId)
}

export async function canViewSolicitud(
  solicitud: {
    createdById: string
    areaSolicitanteId: string
    areas: { areaId: string }[]
  },
  user: { id: string; roleHierarchy?: number | null; permissions?: string[] }
): Promise<boolean> {
  if (isAdminHierarchy(user.roleHierarchy)) return true
  if (user.permissions?.includes('solicitudes.verTodas')) return true
  if (solicitud.createdById === user.id) return true

  const memberships = await prisma.areaMembership.findMany({
    where: { userId: user.id },
    select: { areaId: true }
  })

  const myAreaIds = new Set(memberships.map(m => m.areaId))

  if (myAreaIds.has(solicitud.areaSolicitanteId)) return true

  return solicitud.areas.some(a => myAreaIds.has(a.areaId))
}

export async function canCreateInforme(
  solicitud: SolicitudParaEstado & { createdById: string; areaSolicitanteId: string; fechaEvento: Date },
  user: { id: string; roleHierarchy?: number | null },
  now: Date = new Date()
): Promise<boolean> {
  if (solicitud.cancelada) return false
  if (solicitud.fechaEvento.getTime() >= now.getTime()) return false
  if (!solicitud.areas.some(a => a.estado === EstadoSolicitudArea.APROBADA)) return false
  if (isAdminHierarchy(user.roleHierarchy)) return true
  if (solicitud.createdById === user.id) return true

  return isLeaderOfArea(user.id, solicitud.areaSolicitanteId)
}
