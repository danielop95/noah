'use server'

import {
  AreaMembershipRole,
  CumplimientoProgramacion,
  EstadoSolicitudArea,
  Prisma,
  TipoEvento
} from '@prisma/client'

import prisma from '@/libs/prisma'

import { checkPermission, getAdminOrganizationId, getSessionUser, requirePermission } from './helpers'
import {
  canApproveArea,
  canCancelSolicitud,
  canCreateInforme,
  canEditSolicitud,
  canViewSolicitud,
  computeEstadoGlobal,
  computeUrgente,
  getMyLeaderAreaIds,
  getMyMemberAreaIds,
  isAdminHierarchy
} from './helpers/solicitudesHelpers'
import type { EstadoGlobal } from './helpers/solicitudesHelpers'

// =====================================================
// TIPOS
// =====================================================

export type SolicitudListItem = {
  id: string
  nombreEvento: string
  tipoEvento: TipoEvento
  fechaEvento: Date
  lugar: string
  urgente: boolean
  cancelada: boolean
  createdAt: Date
  createdBy: { id: string; name: string | null; firstName: string | null; lastName: string | null; image: string | null }
  areaSolicitante: { id: string; name: string; icon: string | null; color: string | null }
  areas: Array<{
    id: string
    areaId: string
    estado: EstadoSolicitudArea
    area: { id: string; name: string; icon: string | null; color: string | null }
  }>
  informe: { id: string } | null
  _count: { comentarios: number }
  estadoGlobal: EstadoGlobal
}

export type CreateSolicitudInput = {
  areaSolicitanteId: string
  cargoRol?: string | null
  telefonoContacto?: string | null
  emailContacto?: string | null
  nombreEvento: string
  tipoEvento: TipoEvento
  tipoEventoOtro?: string | null
  fechaEvento: string // ISO date (YYYY-MM-DD)
  horaInicio: string // HH:mm
  horaFin: string // HH:mm
  lugar: string
  descripcionActividad: string
  materialesDisponibles?: string | null
  propositoEvento: string
  objetivoEspecifico: string
  dirigidoA: string
  resultadoEsperado: string
  fechaLimite: string // ISO date
  requiereDifusion: boolean
  inicioComunicacion?: string | null // ISO date
  confirmacion15Dias: boolean
  areas: Array<{ areaId: string; detalleEspecifico: string }>
}

export type UpdateSolicitudInput = Partial<Omit<CreateSolicitudInput, 'areas'>> & {
  areas?: Array<{ areaId: string; detalleEspecifico: string }>
}

export type CreateInformeInput = {
  desarrolloTexto: string
  cumplimiento: CumplimientoProgramacion
  cambiosUltimoMomento?: string | null
  objetivoCumplido: string
  resultadosDestacados: string
  evalOrganizacion: number
  evalComunicacion: number
  evalTrabajoEquipo: number
  evalTiempos: number
  evalEjecucion: number
  saliBien: string
  noSalio: string
  mejoras: string
  linkFotos?: string | null
  linkVideos?: string | null
  linkPiezas?: string | null
  linkPresentaciones?: string | null
  otrosLinks?: string | null
  recomendaciones?: string | null
  comentariosAdicionales?: string | null
}

export type SolicitudFilters = {
  estadoGlobal?: EstadoGlobal | EstadoGlobal[]
  areaId?: string
  tipoEvento?: TipoEvento
  fechaDesde?: string
  fechaHasta?: string
  urgente?: boolean
  search?: string
}

// =====================================================
// CONSTANTES INTERNAS
// =====================================================

const LIST_INCLUDE = {
  createdBy: { select: { id: true, name: true, firstName: true, lastName: true, image: true } },
  areaSolicitante: { select: { id: true, name: true, icon: true, color: true } },
  areas: {
    include: { area: { select: { id: true, name: true, icon: true, color: true } } }
  },
  informe: { select: { id: true } },
  _count: { select: { comentarios: true } }
} satisfies Prisma.SolicitudInclude

const DETAIL_INCLUDE = {
  createdBy: { select: { id: true, name: true, firstName: true, lastName: true, image: true, email: true, phone: true } },
  areaSolicitante: { select: { id: true, name: true, icon: true, color: true, slug: true } },
  canceladaBy: { select: { id: true, name: true, firstName: true, lastName: true } },
  areas: {
    include: {
      area: { select: { id: true, name: true, icon: true, color: true, slug: true } },
      revisadoBy: { select: { id: true, name: true, firstName: true, lastName: true, image: true } }
    },
    orderBy: { createdAt: 'asc' }
  },
  comentarios: {
    include: { autor: { select: { id: true, name: true, firstName: true, lastName: true, image: true } } },
    orderBy: { createdAt: 'asc' }
  },
  eventos: {
    include: {
      actor: { select: { id: true, name: true, firstName: true, lastName: true, image: true } },
      solicitudArea: { include: { area: { select: { id: true, name: true } } } }
    },
    orderBy: { createdAt: 'asc' }
  },
  informe: true
} satisfies Prisma.SolicitudInclude

function withEstadoGlobal<
  T extends { cancelada: boolean; areas: { estado: EstadoSolicitudArea }[]; informe: { id: string } | null }
>(solicitud: T): T & { estadoGlobal: EstadoGlobal } {
  return { ...solicitud, estadoGlobal: computeEstadoGlobal(solicitud) }
}

function parseDate(value: string): Date {
  const d = new Date(value)

  if (Number.isNaN(d.getTime())) throw new Error(`Fecha inválida: ${value}`)

  return d
}

function validateAreasInput(areas: Array<{ areaId: string; detalleEspecifico: string }>) {
  if (areas.length === 0) throw new Error('Debe seleccionar al menos un área destino')

  const ids = areas.map(a => a.areaId)

  if (new Set(ids).size !== ids.length) throw new Error('No puede repetir áreas destino')

  for (const a of areas) {
    if (!a.detalleEspecifico.trim()) {
      throw new Error('Debe describir qué necesita específicamente de cada área')
    }
  }
}

async function verifyAreasOwnership(areaIds: string[], organizationId: string) {
  const found = await prisma.area.findMany({
    where: { id: { in: areaIds }, organizationId, isActive: true },
    select: { id: true }
  })

  if (found.length !== areaIds.length) {
    throw new Error('Una o más áreas no son válidas o están desactivadas')
  }
}

function applyEstadoGlobalFilter<T extends { estadoGlobal: EstadoGlobal }>(
  rows: T[],
  estadoFilter: SolicitudFilters['estadoGlobal']
): T[] {
  if (!estadoFilter) return rows

  const allowed = Array.isArray(estadoFilter) ? estadoFilter : [estadoFilter]

  return rows.filter(r => allowed.includes(r.estadoGlobal))
}

function applyTextSearch<T extends { nombreEvento: string; lugar: string }>(rows: T[], search?: string): T[] {
  if (!search?.trim()) return rows

  const q = search.trim().toLowerCase()

  return rows.filter(r => r.nombreEvento.toLowerCase().includes(q) || r.lugar.toLowerCase().includes(q))
}

// =====================================================
// LISTADOS / BANDEJAS
// =====================================================

export async function getMisSolicitudes(filters?: SolicitudFilters): Promise<SolicitudListItem[]> {
  const session = await requirePermission('solicitudes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  const where: Prisma.SolicitudWhereInput = {
    organizationId,
    createdById: session.user.id,
    ...(filters?.areaId && { OR: [{ areaSolicitanteId: filters.areaId }, { areas: { some: { areaId: filters.areaId } } }] }),
    ...(filters?.tipoEvento && { tipoEvento: filters.tipoEvento }),
    ...(filters?.urgente !== undefined && { urgente: filters.urgente }),
    ...(filters?.fechaDesde && { fechaEvento: { gte: parseDate(filters.fechaDesde) } }),
    ...(filters?.fechaHasta && { fechaEvento: { lte: parseDate(filters.fechaHasta) } })
  }

  const rows = await prisma.solicitud.findMany({
    where,
    include: LIST_INCLUDE,
    orderBy: { createdAt: 'desc' }
  })

  const withEstado = rows.map(withEstadoGlobal)

  return applyEstadoGlobalFilter(applyTextSearch(withEstado, filters?.search), filters?.estadoGlobal)
}

export async function getSolicitudesAMiArea(opts: {
  rol: 'lider' | 'miembro'
  filters?: SolicitudFilters
}): Promise<SolicitudListItem[]> {
  const session = await requirePermission('solicitudes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  const myAreaIds =
    opts.rol === 'lider'
      ? await getMyLeaderAreaIds(session.user.id)
      : await getMyMemberAreaIds(session.user.id)

  if (myAreaIds.length === 0) return []

  const where: Prisma.SolicitudWhereInput = {
    organizationId,
    areas: { some: { areaId: { in: myAreaIds } } },
    ...(opts.filters?.tipoEvento && { tipoEvento: opts.filters.tipoEvento }),
    ...(opts.filters?.urgente !== undefined && { urgente: opts.filters.urgente }),
    ...(opts.filters?.fechaDesde && { fechaEvento: { gte: parseDate(opts.filters.fechaDesde) } }),
    ...(opts.filters?.fechaHasta && { fechaEvento: { lte: parseDate(opts.filters.fechaHasta) } })
  }

  const rows = await prisma.solicitud.findMany({
    where,
    include: LIST_INCLUDE,
    orderBy: [{ urgente: 'desc' }, { fechaEvento: 'asc' }]
  })

  const withEstado = rows.map(withEstadoGlobal)

  return applyEstadoGlobalFilter(applyTextSearch(withEstado, opts.filters?.search), opts.filters?.estadoGlobal)
}

export async function getTodasLasSolicitudes(filters?: SolicitudFilters): Promise<SolicitudListItem[]> {
  const session = await requirePermission('solicitudes', 'verTodas')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  const where: Prisma.SolicitudWhereInput = {
    organizationId,
    ...(filters?.areaId && { OR: [{ areaSolicitanteId: filters.areaId }, { areas: { some: { areaId: filters.areaId } } }] }),
    ...(filters?.tipoEvento && { tipoEvento: filters.tipoEvento }),
    ...(filters?.urgente !== undefined && { urgente: filters.urgente }),
    ...(filters?.fechaDesde && { fechaEvento: { gte: parseDate(filters.fechaDesde) } }),
    ...(filters?.fechaHasta && { fechaEvento: { lte: parseDate(filters.fechaHasta) } })
  }

  const rows = await prisma.solicitud.findMany({
    where,
    include: LIST_INCLUDE,
    orderBy: [{ urgente: 'desc' }, { createdAt: 'desc' }]
  })

  const withEstado = rows.map(withEstadoGlobal)

  return applyEstadoGlobalFilter(applyTextSearch(withEstado, filters?.search), filters?.estadoGlobal)
}

export async function getSolicitudesBandejaCounts() {
  const session = await requirePermission('solicitudes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) return { mis: 0, miAreaLider: 0, miAreaMiembro: 0, todas: 0 }

  const [misPendientes, miAreaLiderIds, miAreaMiembroIds] = await Promise.all([
    prisma.solicitud.count({
      where: {
        organizationId,
        createdById: session.user.id,
        cancelada: false,
        areas: { some: { estado: EstadoSolicitudArea.PENDIENTE } }
      }
    }),
    getMyLeaderAreaIds(session.user.id),
    getMyMemberAreaIds(session.user.id)
  ])

  const miAreaLider = miAreaLiderIds.length
    ? await prisma.solicitudArea.count({
        where: {
          areaId: { in: miAreaLiderIds },
          estado: EstadoSolicitudArea.PENDIENTE,
          solicitud: { organizationId, cancelada: false }
        }
      })
    : 0

  const miAreaMiembro = miAreaMiembroIds.length
    ? await prisma.solicitudArea.count({
        where: {
          areaId: { in: miAreaMiembroIds },
          estado: EstadoSolicitudArea.PENDIENTE,
          solicitud: { organizationId, cancelada: false }
        }
      })
    : 0

  const canVerTodas = await checkPermission('solicitudes', 'verTodas')

  const todas = canVerTodas
    ? await prisma.solicitud.count({
        where: {
          organizationId,
          cancelada: false,
          areas: { some: { estado: EstadoSolicitudArea.PENDIENTE } }
        }
      })
    : 0

  return { mis: misPendientes, miAreaLider, miAreaMiembro, todas }
}

// =====================================================
// DETALLE
// =====================================================

export async function getSolicitudById(id: string) {
  const session = await requirePermission('solicitudes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  const solicitud = await prisma.solicitud.findUnique({
    where: { id },
    include: DETAIL_INCLUDE
  })

  if (!solicitud || solicitud.organizationId !== organizationId) {
    throw new Error('Solicitud no encontrada o no autorizado')
  }

  const user = { id: session.user.id, roleHierarchy: session.user.roleHierarchy, permissions: session.user.permissions }
  const visible = await canViewSolicitud(solicitud, user)

  if (!visible) throw new Error('No tiene permiso para ver esta solicitud')

  // Calcular permisos para UI
  const myLeaderAreaIds = isAdminHierarchy(user.roleHierarchy)
    ? solicitud.areas.map(a => a.areaId)
    : await getMyLeaderAreaIds(user.id)

  const canApproveAreaIds = solicitud.areas
    .filter(a => a.estado === EstadoSolicitudArea.PENDIENTE && myLeaderAreaIds.includes(a.areaId))
    .map(a => a.id)

  const estadoGlobal = computeEstadoGlobal(solicitud)
  const canEdit = canEditSolicitud(solicitud, user)
  const canCancel = canCancelSolicitud(solicitud, user)
  const canInforme = await canCreateInforme(solicitud, user)

  return {
    ...solicitud,
    estadoGlobal,
    permissions: {
      canEdit,
      canCancel,
      canCreateInforme: canInforme && !solicitud.informe,
      canEditInforme: canInforme && !!solicitud.informe,
      canApproveAreaIds
    }
  }
}

// =====================================================
// CREATE / UPDATE / CANCEL
// =====================================================

export async function createSolicitud(data: CreateSolicitudInput) {
  const session = await requirePermission('solicitudes', 'crear')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  if (!data.nombreEvento.trim()) throw new Error('El nombre del evento es obligatorio')

  validateAreasInput(data.areas)

  const allAreaIds = [data.areaSolicitanteId, ...data.areas.map(a => a.areaId)]

  await verifyAreasOwnership([...new Set(allAreaIds)], organizationId)

  const fechaEvento = parseDate(data.fechaEvento)
  const fechaLimite = parseDate(data.fechaLimite)
  const inicioComunicacion = data.inicioComunicacion ? parseDate(data.inicioComunicacion) : null
  const urgente = computeUrgente(fechaEvento)

  return prisma.$transaction(async tx => {
    const solicitud = await tx.solicitud.create({
      data: {
        organizationId,
        createdById: session.user.id,
        areaSolicitanteId: data.areaSolicitanteId,
        cargoRol: data.cargoRol ?? null,
        telefonoContacto: data.telefonoContacto ?? null,
        emailContacto: data.emailContacto ?? null,
        nombreEvento: data.nombreEvento.trim(),
        tipoEvento: data.tipoEvento,
        tipoEventoOtro: data.tipoEventoOtro?.trim() || null,
        fechaEvento,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        lugar: data.lugar.trim(),
        descripcionActividad: data.descripcionActividad,
        materialesDisponibles: data.materialesDisponibles?.trim() || null,
        propositoEvento: data.propositoEvento,
        objetivoEspecifico: data.objetivoEspecifico,
        dirigidoA: data.dirigidoA,
        resultadoEsperado: data.resultadoEsperado,
        fechaLimite,
        requiereDifusion: data.requiereDifusion,
        inicioComunicacion,
        confirmacion15Dias: data.confirmacion15Dias,
        urgente,
        areas: {
          create: data.areas.map(a => ({
            areaId: a.areaId,
            detalleEspecifico: a.detalleEspecifico.trim(),
            estado: EstadoSolicitudArea.PENDIENTE
          }))
        }
      },
      include: { areas: true }
    })

    await tx.solicitudEvento.create({
      data: {
        solicitudId: solicitud.id,
        tipo: 'CREADA',
        toEstado: 'pendiente',
        actorId: session.user.id
      }
    })

    return solicitud
  })
}

export async function updateSolicitud(id: string, data: UpdateSolicitudInput) {
  const session = await requirePermission('solicitudes', 'editarPropia')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  const existing = await prisma.solicitud.findUnique({
    where: { id },
    include: { areas: { select: { estado: true } } }
  })

  if (!existing || existing.organizationId !== organizationId) {
    throw new Error('Solicitud no encontrada o no autorizado')
  }

  const user = { id: session.user.id, roleHierarchy: session.user.roleHierarchy }

  if (!canEditSolicitud(existing, user)) {
    throw new Error('No puede editar esta solicitud: ya tiene áreas revisadas o está cancelada')
  }

  // Validar áreas si vienen
  if (data.areas) {
    validateAreasInput(data.areas)
    const allAreaIds = [data.areaSolicitanteId ?? existing.areaSolicitanteId, ...data.areas.map(a => a.areaId)]

    await verifyAreasOwnership([...new Set(allAreaIds)], organizationId)
  } else if (data.areaSolicitanteId && data.areaSolicitanteId !== existing.areaSolicitanteId) {
    await verifyAreasOwnership([data.areaSolicitanteId], organizationId)
  }

  const updateData: Prisma.SolicitudUpdateInput = {}

  if (data.areaSolicitanteId !== undefined) {
    updateData.areaSolicitante = { connect: { id: data.areaSolicitanteId } }
  }

  if (data.cargoRol !== undefined) updateData.cargoRol = data.cargoRol
  if (data.telefonoContacto !== undefined) updateData.telefonoContacto = data.telefonoContacto
  if (data.emailContacto !== undefined) updateData.emailContacto = data.emailContacto
  if (data.nombreEvento !== undefined) updateData.nombreEvento = data.nombreEvento.trim()
  if (data.tipoEvento !== undefined) updateData.tipoEvento = data.tipoEvento
  if (data.tipoEventoOtro !== undefined) updateData.tipoEventoOtro = data.tipoEventoOtro?.trim() || null
  if (data.horaInicio !== undefined) updateData.horaInicio = data.horaInicio
  if (data.horaFin !== undefined) updateData.horaFin = data.horaFin
  if (data.lugar !== undefined) updateData.lugar = data.lugar.trim()
  if (data.descripcionActividad !== undefined) updateData.descripcionActividad = data.descripcionActividad
  if (data.materialesDisponibles !== undefined) updateData.materialesDisponibles = data.materialesDisponibles
  if (data.propositoEvento !== undefined) updateData.propositoEvento = data.propositoEvento
  if (data.objetivoEspecifico !== undefined) updateData.objetivoEspecifico = data.objetivoEspecifico
  if (data.dirigidoA !== undefined) updateData.dirigidoA = data.dirigidoA
  if (data.resultadoEsperado !== undefined) updateData.resultadoEsperado = data.resultadoEsperado
  if (data.requiereDifusion !== undefined) updateData.requiereDifusion = data.requiereDifusion
  if (data.confirmacion15Dias !== undefined) updateData.confirmacion15Dias = data.confirmacion15Dias

  let newFechaEvento: Date | undefined

  if (data.fechaEvento !== undefined) {
    newFechaEvento = parseDate(data.fechaEvento)
    updateData.fechaEvento = newFechaEvento
    updateData.urgente = computeUrgente(newFechaEvento)
  }

  if (data.fechaLimite !== undefined) updateData.fechaLimite = parseDate(data.fechaLimite)

  if (data.inicioComunicacion !== undefined) {
    updateData.inicioComunicacion = data.inicioComunicacion ? parseDate(data.inicioComunicacion) : null
  }

  return prisma.$transaction(async tx => {
    await tx.solicitud.update({ where: { id }, data: updateData })

    if (data.areas) {
      // Reemplazo total. Como todas están PENDIENTE, es seguro borrar.
      await tx.solicitudArea.deleteMany({ where: { solicitudId: id } })
      await tx.solicitudArea.createMany({
        data: data.areas.map(a => ({
          solicitudId: id,
          areaId: a.areaId,
          detalleEspecifico: a.detalleEspecifico.trim(),
          estado: EstadoSolicitudArea.PENDIENTE
        }))
      })
    }

    await tx.solicitudEvento.create({
      data: {
        solicitudId: id,
        tipo: 'EDITADA',
        actorId: session.user.id
      }
    })

    return tx.solicitud.findUnique({ where: { id }, include: { areas: true } })
  })
}

export async function cancelSolicitud(id: string, motivo: string) {
  const session = await requirePermission('solicitudes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  if (!motivo.trim()) throw new Error('Debe indicar un motivo de cancelación')

  const existing = await prisma.solicitud.findUnique({
    where: { id },
    include: {
      areas: { select: { estado: true } },
      informe: { select: { id: true } }
    }
  })

  if (!existing || existing.organizationId !== organizationId) {
    throw new Error('Solicitud no encontrada o no autorizado')
  }

  const user = { id: session.user.id, roleHierarchy: session.user.roleHierarchy }

  if (!canCancelSolicitud(existing, user)) {
    throw new Error('No puede cancelar esta solicitud')
  }

  return prisma.$transaction(async tx => {
    await tx.solicitud.update({
      where: { id },
      data: {
        cancelada: true,
        canceladaById: session.user.id,
        canceladaMotivo: motivo.trim(),
        canceladaAt: new Date()
      }
    })

    await tx.solicitudEvento.create({
      data: {
        solicitudId: id,
        tipo: 'CANCELADA',
        toEstado: 'cancelada',
        actorId: session.user.id,
        motivo: motivo.trim()
      }
    })

    return { success: true }
  })
}

// =====================================================
// APROBAR / RECHAZAR SOLICITUDAREA
// =====================================================

export async function approveSolicitudArea(solicitudAreaId: string) {
  const session = await requirePermission('solicitudes', 'aprobar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  const sa = await prisma.solicitudArea.findUnique({
    where: { id: solicitudAreaId },
    include: { solicitud: { select: { organizationId: true, cancelada: true } } }
  })

  if (!sa || sa.solicitud.organizationId !== organizationId) {
    throw new Error('Solicitud no encontrada o no autorizado')
  }

  if (sa.solicitud.cancelada) throw new Error('No se puede aprobar: la solicitud está cancelada')

  const user = { id: session.user.id, roleHierarchy: session.user.roleHierarchy }

  if (!(await canApproveArea(sa, user))) {
    throw new Error('No tiene permiso para aprobar esta solicitud (debe ser líder del área destino)')
  }

  return prisma.$transaction(async tx => {
    await tx.solicitudArea.update({
      where: { id: solicitudAreaId },
      data: {
        estado: EstadoSolicitudArea.APROBADA,
        revisadoById: session.user.id,
        revisadoAt: new Date(),
        motivoRechazo: null
      }
    })

    await tx.solicitudEvento.create({
      data: {
        solicitudId: sa.solicitudId,
        solicitudAreaId,
        tipo: 'APROBADA_AREA',
        fromEstado: 'PENDIENTE',
        toEstado: 'APROBADA',
        actorId: session.user.id
      }
    })

    return { success: true }
  })
}

export async function rejectSolicitudArea(solicitudAreaId: string, motivo: string) {
  const session = await requirePermission('solicitudes', 'aprobar')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  if (!motivo.trim()) throw new Error('Debe indicar un motivo de rechazo')

  const sa = await prisma.solicitudArea.findUnique({
    where: { id: solicitudAreaId },
    include: { solicitud: { select: { organizationId: true, cancelada: true } } }
  })

  if (!sa || sa.solicitud.organizationId !== organizationId) {
    throw new Error('Solicitud no encontrada o no autorizado')
  }

  if (sa.solicitud.cancelada) throw new Error('No se puede rechazar: la solicitud está cancelada')

  const user = { id: session.user.id, roleHierarchy: session.user.roleHierarchy }

  if (!(await canApproveArea(sa, user))) {
    throw new Error('No tiene permiso para rechazar esta solicitud (debe ser líder del área destino)')
  }

  return prisma.$transaction(async tx => {
    await tx.solicitudArea.update({
      where: { id: solicitudAreaId },
      data: {
        estado: EstadoSolicitudArea.RECHAZADA,
        revisadoById: session.user.id,
        revisadoAt: new Date(),
        motivoRechazo: motivo.trim()
      }
    })

    await tx.solicitudEvento.create({
      data: {
        solicitudId: sa.solicitudId,
        solicitudAreaId,
        tipo: 'RECHAZADA_AREA',
        fromEstado: 'PENDIENTE',
        toEstado: 'RECHAZADA',
        actorId: session.user.id,
        motivo: motivo.trim()
      }
    })

    return { success: true }
  })
}

// =====================================================
// COMENTARIOS
// =====================================================

export async function addComentario(solicitudId: string, texto: string) {
  const session = await requirePermission('solicitudes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  if (!texto.trim()) throw new Error('El comentario no puede estar vacío')

  const solicitud = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
    select: {
      organizationId: true,
      createdById: true,
      areaSolicitanteId: true,
      areas: { select: { areaId: true } }
    }
  })

  if (!solicitud || solicitud.organizationId !== organizationId) {
    throw new Error('Solicitud no encontrada o no autorizado')
  }

  const user = { id: session.user.id, roleHierarchy: session.user.roleHierarchy, permissions: session.user.permissions }

  if (!(await canViewSolicitud(solicitud, user))) {
    throw new Error('No tiene permiso para comentar en esta solicitud')
  }

  return prisma.$transaction(async tx => {
    const comentario = await tx.solicitudComentario.create({
      data: {
        solicitudId,
        autorId: session.user.id,
        texto: texto.trim()
      },
      include: {
        autor: { select: { id: true, name: true, firstName: true, lastName: true, image: true } }
      }
    })

    await tx.solicitudEvento.create({
      data: {
        solicitudId,
        tipo: 'COMENTARIO',
        actorId: session.user.id
      }
    })

    return comentario
  })
}

// =====================================================
// INFORME
// =====================================================

function validateInformeInput(data: CreateInformeInput) {
  const evals = [
    data.evalOrganizacion,
    data.evalComunicacion,
    data.evalTrabajoEquipo,
    data.evalTiempos,
    data.evalEjecucion
  ]

  for (const v of evals) {
    if (!Number.isInteger(v) || v < 1 || v > 5) {
      throw new Error('Las evaluaciones deben ser enteros entre 1 y 5')
    }
  }

  if (!data.desarrolloTexto.trim()) throw new Error('Debe describir el desarrollo del evento')
  if (!data.objetivoCumplido.trim()) throw new Error('Debe indicar si se cumplió el objetivo')
  if (!data.resultadosDestacados.trim()) throw new Error('Debe describir los resultados destacados')
  if (!data.saliBien.trim()) throw new Error('Debe indicar qué salió bien')
  if (!data.noSalio.trim()) throw new Error('Debe indicar qué no salió como esperaba')
  if (!data.mejoras.trim()) throw new Error('Debe indicar qué se puede mejorar')
}

async function loadSolicitudForInforme(solicitudId: string, organizationId: string) {
  const s = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
    include: {
      areas: { select: { estado: true } },
      informe: { select: { id: true } }
    }
  })

  if (!s || s.organizationId !== organizationId) {
    throw new Error('Solicitud no encontrada o no autorizado')
  }

  return s
}

export async function createInforme(solicitudId: string, data: CreateInformeInput) {
  const session = await requirePermission('solicitudes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  validateInformeInput(data)

  const solicitud = await loadSolicitudForInforme(solicitudId, organizationId)

  if (solicitud.informe) throw new Error('Esta solicitud ya tiene un informe')

  const user = { id: session.user.id, roleHierarchy: session.user.roleHierarchy }

  if (!(await canCreateInforme(solicitud, user))) {
    throw new Error('No puede crear el informe: el evento aún no ha pasado, no fue aprobado, o no tiene permiso')
  }

  return prisma.$transaction(async tx => {
    const informe = await tx.informeEvento.create({
      data: {
        solicitudId,
        createdById: session.user.id,
        desarrolloTexto: data.desarrolloTexto.trim(),
        cumplimiento: data.cumplimiento,
        cambiosUltimoMomento: data.cambiosUltimoMomento?.trim() || null,
        objetivoCumplido: data.objetivoCumplido.trim(),
        resultadosDestacados: data.resultadosDestacados.trim(),
        evalOrganizacion: data.evalOrganizacion,
        evalComunicacion: data.evalComunicacion,
        evalTrabajoEquipo: data.evalTrabajoEquipo,
        evalTiempos: data.evalTiempos,
        evalEjecucion: data.evalEjecucion,
        saliBien: data.saliBien.trim(),
        noSalio: data.noSalio.trim(),
        mejoras: data.mejoras.trim(),
        linkFotos: data.linkFotos?.trim() || null,
        linkVideos: data.linkVideos?.trim() || null,
        linkPiezas: data.linkPiezas?.trim() || null,
        linkPresentaciones: data.linkPresentaciones?.trim() || null,
        otrosLinks: data.otrosLinks?.trim() || null,
        recomendaciones: data.recomendaciones?.trim() || null,
        comentariosAdicionales: data.comentariosAdicionales?.trim() || null
      }
    })

    await tx.solicitudEvento.create({
      data: {
        solicitudId,
        tipo: 'INFORME_CREADO',
        toEstado: 'completada',
        actorId: session.user.id
      }
    })

    return informe
  })
}

export async function updateInforme(solicitudId: string, data: CreateInformeInput) {
  const session = await requirePermission('solicitudes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  validateInformeInput(data)

  const solicitud = await loadSolicitudForInforme(solicitudId, organizationId)

  if (!solicitud.informe) throw new Error('Esta solicitud no tiene informe para actualizar')

  const user = { id: session.user.id, roleHierarchy: session.user.roleHierarchy }

  if (!(await canCreateInforme(solicitud, user))) {
    throw new Error('No tiene permiso para editar el informe')
  }

  return prisma.$transaction(async tx => {
    const informe = await tx.informeEvento.update({
      where: { solicitudId },
      data: {
        desarrolloTexto: data.desarrolloTexto.trim(),
        cumplimiento: data.cumplimiento,
        cambiosUltimoMomento: data.cambiosUltimoMomento?.trim() || null,
        objetivoCumplido: data.objetivoCumplido.trim(),
        resultadosDestacados: data.resultadosDestacados.trim(),
        evalOrganizacion: data.evalOrganizacion,
        evalComunicacion: data.evalComunicacion,
        evalTrabajoEquipo: data.evalTrabajoEquipo,
        evalTiempos: data.evalTiempos,
        evalEjecucion: data.evalEjecucion,
        saliBien: data.saliBien.trim(),
        noSalio: data.noSalio.trim(),
        mejoras: data.mejoras.trim(),
        linkFotos: data.linkFotos?.trim() || null,
        linkVideos: data.linkVideos?.trim() || null,
        linkPiezas: data.linkPiezas?.trim() || null,
        linkPresentaciones: data.linkPresentaciones?.trim() || null,
        otrosLinks: data.otrosLinks?.trim() || null,
        recomendaciones: data.recomendaciones?.trim() || null,
        comentariosAdicionales: data.comentariosAdicionales?.trim() || null
      }
    })

    await tx.solicitudEvento.create({
      data: {
        solicitudId,
        tipo: 'INFORME_EDITADO',
        actorId: session.user.id
      }
    })

    return informe
  })
}

export async function getInformeBySolicitudId(solicitudId: string) {
  const session = await requirePermission('solicitudes', 'ver')
  const organizationId = await getAdminOrganizationId(session.user.id)

  if (!organizationId) throw new Error('El usuario no pertenece a ninguna organización')

  const solicitud = await prisma.solicitud.findUnique({
    where: { id: solicitudId },
    select: {
      organizationId: true,
      createdById: true,
      areaSolicitanteId: true,
      areas: { select: { areaId: true } },
      informe: true
    }
  })

  if (!solicitud || solicitud.organizationId !== organizationId) {
    throw new Error('Solicitud no encontrada o no autorizado')
  }

  const user = { id: session.user.id, roleHierarchy: session.user.roleHierarchy, permissions: session.user.permissions }

  if (!(await canViewSolicitud(solicitud, user))) {
    throw new Error('No tiene permiso para ver el informe')
  }

  return solicitud.informe
}

// =====================================================
// UTILIDADES PARA FORMULARIOS
// =====================================================

export async function getMyContactDefaults() {
  const user = await getSessionUser()
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { phone: true, email: true, userRole: { select: { name: true } } }
  })

  return {
    cargoRol: dbUser?.userRole?.name ?? null,
    telefonoContacto: dbUser?.phone ?? null,
    emailContacto: dbUser?.email ?? null
  }
}
