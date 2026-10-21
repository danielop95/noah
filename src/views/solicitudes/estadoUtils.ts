import type { EstadoGlobal } from '@/app/server/helpers/solicitudesHelpers'

export const ESTADO_LABEL: Record<EstadoGlobal, string> = {
  pendiente: 'Pendiente',
  enRevision: 'En revisión',
  aprobada: 'Aprobada',
  parcialmenteAprobada: 'Parcialmente aprobada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
  completada: 'Completada'
}

export const ESTADO_COLOR: Record<EstadoGlobal, 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'> = {
  pendiente: 'warning',
  enRevision: 'info',
  aprobada: 'success',
  parcialmenteAprobada: 'info',
  rechazada: 'error',
  cancelada: 'default',
  completada: 'success'
}

export const TIPO_EVENTO_LABEL: Record<string, string> = {
  SERVICIO: 'Servicio',
  EVENTO_ESPECIAL: 'Evento especial',
  REUNION_INTERNA: 'Reunión interna',
  OTRO: 'Otro'
}

export const SOLICITUD_AREA_ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada'
}

export const SOLICITUD_AREA_ESTADO_COLOR: Record<string, 'default' | 'success' | 'error' | 'warning'> = {
  PENDIENTE: 'warning',
  APROBADA: 'success',
  RECHAZADA: 'error'
}

export const CUMPLIMIENTO_LABEL: Record<string, string> = {
  SI: 'Sí',
  PARCIAL: 'Parcialmente',
  NO: 'No'
}

export const SOLICITUD_EVENTO_LABEL: Record<string, string> = {
  CREADA: 'Solicitud creada',
  EDITADA: 'Solicitud editada',
  CANCELADA: 'Solicitud cancelada',
  APROBADA_AREA: 'Área aprobada',
  RECHAZADA_AREA: 'Área rechazada',
  COMENTARIO: 'Nuevo comentario',
  INFORME_CREADO: 'Informe creado',
  INFORME_EDITADO: 'Informe editado'
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '-'
  const date = typeof d === 'string' ? new Date(d) : d

  return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return '-'
  const date = typeof d === 'string' ? new Date(d) : d

  return date.toLocaleString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

export function getDisplayName(u: { name?: string | null; firstName?: string | null; lastName?: string | null; email?: string | null } | null | undefined): string {
  if (!u) return 'Desconocido'

  return u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'Sin nombre'
}
